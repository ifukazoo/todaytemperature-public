/**
 * Chart.jsを使用した気象データ可視化チャート管理
 * 気温・湿度・気圧の3種類のチャートを管理
 */
export class WeatherCharts {
    constructor() {
        this.temperatureChart = null;
        this.pressureChart = null;
        this.humidityChart = null;
    }

    initCharts() {
        this.initTemperatureChart();
        this.initHumidityChart();
        this.initPressureChart();
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
}