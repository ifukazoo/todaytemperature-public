/**
 * Chart.jsを使用した気象データ可視化チャート管理
 * 気温・湿度・気圧の3種類のチャートを管理
 */
export class WeatherCharts {
    constructor() {
        this.temperatureChart = null;
        this.pressureChart = null;
        this.humidityChart = null;
        this.weeklyTemperatureChart = null;
    }

    initCharts() {
        this.initTemperatureChart();
        this.initHumidityChart();
        this.initPressureChart();
        this.initWeeklyTemperatureChart();
    }

    initTemperatureChart() {
        const ctx = document.getElementById('temperatureChart').getContext('2d');
        this.temperatureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '気温 (°C)',
                    data: [],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: '気温 (°C)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '時刻'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '今日の気温変化'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    initHumidityChart() {
        const ctx = document.getElementById('humidityChart').getContext('2d');
        this.humidityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '湿度 (%)',
                    data: [],
                    borderColor: 'rgba(116, 185, 255, 1)',
                    backgroundColor: 'rgba(116, 185, 255, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: '湿度 (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '時刻'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '今日の湿度変化'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    initPressureChart() {
        const ctx = document.getElementById('pressureChart').getContext('2d');
        this.pressureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '気圧 (hPa)',
                    data: [],
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: '気圧 (hPa)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '時刻'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '今日の気圧変化'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    updateCharts(weatherData, stationName) {
        const labels = weatherData.map(data => data.time);
        const temperatures = weatherData.map(data => data.temperature);
        const humidities = weatherData.map(data => data.humidity);
        const pressures = weatherData.map(data => data.pressure);

        // 気温チャート更新
        this.temperatureChart.data.labels = labels;
        this.temperatureChart.data.datasets[0].data = temperatures;
        this.temperatureChart.options.plugins.title.text = `${stationName} - 今日の気温変化`;
        this.temperatureChart.update();

        // 湿度チャート更新
        this.humidityChart.data.labels = labels;
        this.humidityChart.data.datasets[0].data = humidities;
        this.humidityChart.options.plugins.title.text = `${stationName} - 今日の湿度変化`;
        this.humidityChart.update();

        // 気圧チャート更新
        this.pressureChart.data.labels = labels;
        this.pressureChart.data.datasets[0].data = pressures;
        this.pressureChart.options.plugins.title.text = `${stationName} - 今日の気圧変化`;
        this.pressureChart.update();
    }

    initWeeklyTemperatureChart() {
        const ctx = document.getElementById('weeklyTemperatureChart').getContext('2d');
        this.weeklyTemperatureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '気温 (°C)',
                    data: [],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                    pointBorderColor: 'rgba(255, 255, 255, 0.8)',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: '気温 (°C)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '日時',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            callback: function(value, index, values) {
                                const label = this.getLabelForValue(value);
                                // 00:00のみ表示（日付部分）
                                if (label && label.includes('00:00')) {
                                    return label.split(' ')[0]; // 日付部分のみ
                                }
                                return '';
                            },
                            filter: function(value, index, values) {
                                const label = this.getLabelForValue(value);
                                // 00:00のみ表示
                                return label && label.includes('00:00');
                            }
                        },
                        grid: {
                            color: function(context) {
                                const label = context.chart.data.labels[context.index];
                                // 00:00のグリッドのみ表示
                                if (label && label.includes('00:00')) {
                                    return 'rgba(0,0,0,0.3)';
                                }
                                return 'transparent';
                            },
                            lineWidth: function(context) {
                                const label = context.chart.data.labels[context.index];
                                // 00:00のグリッドのみ表示
                                if (label && label.includes('00:00')) {
                                    return 1;
                                }
                                return 0;
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '過去7日間の気温変化',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'nearest',
                        intersect: false,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255,255,255,0.2)',
                        borderWidth: 1,
                        callbacks: {
                            title: function(tooltipItems) {
                                return tooltipItems[0].label;
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        });
    }

    updateWeeklyTemperatureChart(weeklyData, stationName) {
        this.weeklyTemperatureChart.data.labels = weeklyData.labels;
        this.weeklyTemperatureChart.data.datasets[0].data = weeklyData.temperatures;
        this.weeklyTemperatureChart.options.plugins.title.text = `${stationName} - 過去7日間の気温変化`;
        this.weeklyTemperatureChart.update();
    }
}