import os
import pandas as pd
import unicodedata

def analyze_city_names(directory):
    file_stats = {}

    for filename in os.listdir(directory):
        if filename.endswith('.csv'):
            file_path = os.path.join(directory, filename)
            try:
                data = pd.read_csv(file_path)
                
                if 'city name' in data.columns:
                    # Análise Básica
                    lengths = data['city name'].str.len()
                    mean_length = lengths.mean()
                    median_length = lengths.median()
                    std_dev_length = lengths.std()
                    
                    # Novas Métricas
                    total_entries = len(data)
                    unique_names = data['city name'].nunique()
                    duplicate_ratio = (total_entries - unique_names) / total_entries if total_entries > 0 else 0
                    
                    # Nomes Longos (dois thresholds)
                    long_names_15 = (lengths > 15).sum()
                    long_names_20 = (lengths > 20).sum()
                    
                    # Caracteres Especiais
                    has_special_chars = data['city name'].apply(
                        lambda x: any(unicodedata.category(c).startswith('S') for c in str(x))
                    )
                    special_chars_ratio = has_special_chars.mean()
                    
                    # Diversidade de Países (novo critério)
                    country_diversity = data['country'].nunique()
                    most_common_country = data['country'].mode()[0] if not data['country'].mode().empty else None
                    
                    # Outliers (valores extremos)
                    q75, q25 = lengths.quantile(0.75), lengths.quantile(0.25)
                    iqr = q75 - q25
                    outlier_count = lengths[(lengths > q75 + 1.5*iqr) | (lengths < q25 - 1.5*iqr)].count()
                    
                    file_stats[filename] = {
                        'mean': mean_length,
                        'median': median_length,
                        'std_dev': std_dev_length,
                        'cv': std_dev_length / mean_length if mean_length > 0 else 0,  # Coeficiente de Variação
                        'total_entries': total_entries,
                        'unique_names': unique_names,
                        'duplicate_ratio': duplicate_ratio,
                        'long_names_15': long_names_15,
                        'long_names_20': long_names_20,
                        'special_chars_ratio': special_chars_ratio,
                        'country_diversity': country_diversity,
                        'most_common_country': most_common_country,
                        'outlier_count': outlier_count
                    }
            except Exception as e:
                print(f"Erro ao ler o arquivo {filename}: {e}")

    return file_stats

def calculate_composite_score(stats):
    # Pesos ajustáveis para cada critério (quanto maior, mais impacta negativamente)
    weights = {
        'mean': 0.25,
        'duplicate_ratio': 0.20,
        'cv': 0.15,
        'long_names_20': 0.10,
        'special_chars_ratio': 0.10,
        'outlier_count': 0.10,
        'country_diversity': -0.10  # Diversidade alta é positivo
    }
    
    score = 0
    for key, weight in weights.items():
        normalized_value = stats[key] / max(stats[key], 1)  # Evitar divisão por zero
        score += normalized_value * weight
    
    return score

def main():
    directory = os.getcwd()
    file_stats = analyze_city_names(directory)

    # Calcular scores compostos
    ranking_data = []
    for filename, stats in file_stats.items():
        score = calculate_composite_score(stats)
        ranking_data.append((filename, score, stats))

    # Ordenar do PIOR (maior score) para o MELHOR
    sorted_ranking = sorted(ranking_data, key=lambda x: x[1], reverse=True)

    with open('advanced_analysis_report.txt', 'w', encoding='utf-8') as f:
        # Cabeçalho Detalhado
        f.write("RELATÓRIO AVANÇADO DE ANÁLISE DE GRUPOS DE CIDADES\n")
        f.write("=" * 120 + "\n\n")
        
        # Ranking Global
        f.write("RANKING GLOBAL (PIOR → MELHOR)\n")
        f.write("-" * 120 + "\n")
        f.write(f"{'Posição':<8} {'Arquivo':<30} {'Score':<10} {'Média':<8} {'Duplicados':<12} {'CV':<8} {'Longos (>20)':<12} {'Outliers':<10} {'Países':<10}\n")
        f.write("-" * 120 + "\n")
        for rank, (filename, score, stats) in enumerate(sorted_ranking, 1):
            f.write(f"{rank:<8} {filename:<30} {score:<10.2f} {stats['mean']:<8.2f} {stats['duplicate_ratio']:<12.2%} "
                    f"{stats['cv']:<8.2f} {stats['long_names_20']:<12} {stats['outlier_count']:<10} {stats['country_diversity']:<10}\n")
        
        # Detalhes do Pior Grupo
        worst_file = sorted_ranking[0][0]
        worst_stats = sorted_ranking[0][2]
        f.write("\n\n🔴 PIOR GRUPO IDENTIFICADO 🔴\n")
        f.write(f"Arquivo: {worst_file}\n")
        f.write(f"Score Total: {worst_stats['mean']:.2f} (Quanto maior, pior)\n")
        f.write("Características Críticas:\n")
        f.write(f"- Média de caracteres: {worst_stats['mean']:.2f}\n")
        f.write(f"- Taxa de duplicatas: {worst_stats['duplicate_ratio']:.2%}\n")
        f.write(f"- Nomes longos (>20): {worst_stats['long_names_20']}\n")
        f.write(f"- Outliers detectados: {worst_stats['outlier_count']}\n")
        f.write(f"- Diversidade de países: {worst_stats['country_diversity']} (Baixa diversidade aumenta risco)\n")
        f.write(f"- País predominante: {worst_stats['most_common_country']}\n")

        # Análise Técnica Detalhada por Arquivo
        f.write("\n\nANÁLISE INDIVIDUAL DETALHADA\n")
        f.write("=" * 120 + "\n")
        for filename, stats in file_stats.items():
            f.write(f"\n📁 Arquivo: {filename}\n")
            f.write(f"- Média Comprimento: {stats['mean']:.2f} | Mediana: {stats['median']} | Desvio: {stats['std_dev']:.2f}\n")
            f.write(f"- Coef. Variação: {stats['cv']:.2f} (Alto > 0.5)\n")
            f.write(f"- Duplicatas: {stats['duplicate_ratio']:.2%} | Únicos: {stats['unique_names']}/{stats['total_entries']}\n")
            f.write(f"- Nomes Longos (>15): {stats['long_names_15']} | (>20): {stats['long_names_20']}\n")
            f.write(f"- Caracteres Especiais: {stats['special_chars_ratio']:.2%}\n")
            f.write(f"- Diversidade: {stats['country_diversity']} países | Mais comum: {stats['most_common_country']}\n")
            f.write(f"- Outliers (IQR): {stats['outlier_count']}\n")

if __name__ == "__main__":
    main()