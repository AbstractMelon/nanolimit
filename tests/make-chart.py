import matplotlib.pyplot as plt
import numpy as np

def plot_benchmark_comparison(data):
    categories = list(data.keys())
    single = [data[cat]["Single key performance"] for cat in categories]
    multiple = [data[cat]["Multiple keys performance"] for cat in categories]
    memory = [data[cat]["Memory usage"]["rss"] for cat in categories]

    max_memory_value = max(memory)
    memory_scaled = [value / max_memory_value * max(single) * 0.3 for value in memory]

    y = np.arange(len(categories))
    width = 0.25

    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=(10, 6))

    bar1 = ax.barh(y - width, single, width, label='Single key performance', color='#1f77b4')
    bar2 = ax.barh(y, multiple, width, label='Multiple keys performance', color='#ff7f0e')
    bar3 = ax.barh(y + width, memory_scaled, width, label='Memory usage (scaled)', color='#d62728')

    ax.set_ylabel('Test Categories', fontsize=12)
    ax.set_xlabel('Operations per second', fontsize=12)
    ax.set_title('Benchmark Comparison', fontsize=14, fontweight='bold')
    ax.set_yticks(y)
    ax.set_yticklabels(categories, fontsize=10)
    ax.legend(fontsize=10)

    for bars in [bar1, bar2, bar3]:
        for bar in bars:
            width = bar.get_width()
            ax.text(width + 0.002, bar.get_y() + bar.get_height()/2., f'{width:.2f}', ha='left', va='center', fontsize=9)

    plt.tight_layout()
    plt.show()

# Data
data = {
    "NanoRate (Default config)": {
        "Single key performance": 12217539,
        "Multiple keys performance": 1379913,
        "Memory usage": {
            "rss": 105.61
        },
    },
    "NanoRate (Short window)": {
        "Single key performance": 6459566,
        "Multiple keys performance": 1588348,
        "Memory usage": {
            "rss": 150.48
        },
    },
    "NanoRate (Large window)": {
        "Single key performance": 9230648,
        "Multiple keys performance": 1046487,
        "Memory usage": {
            "rss": 173.95
        },
    },
    "express-rate-limit": {
        "Single key performance": 928587,
        "Multiple keys performance": 806524,
        "Memory usage": {
            "rss": 420.08
        },
    },
    "rate-limiter-flexible": {
        "Single key performance": 1053551,
        "Multiple keys performance": 420171,
        "Memory usage": {
            "rss": 509.44
        },
    }
}

plot_benchmark_comparison(data)

