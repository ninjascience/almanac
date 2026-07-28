import * as d3 from 'd3';

export const millisecondsInDay = 1000 * 60 * 60 * 24;

export const radians = (deg) => deg * (Math.PI / 180);

export const tempColors = [
    { minTemp: 0,   color: '#B399FF' },
    { minTemp: 5,   color: '#9AA2FA' },
    { minTemp: 10,  color: '#80ABF4' },
    { minTemp: 15,  color: '#66B4EF' },
    { minTemp: 20,  color: '#4DBEE9' },
    { minTemp: 25,  color: '#33C7E4' },
    { minTemp: 30,  color: '#19D0DE' },
    { minTemp: 35,  color: '#00D96D' },
    { minTemp: 40,  color: '#1CDD61' },
    { minTemp: 45,  color: '#55E649' },
    { minTemp: 50,  color: '#71EA3D' },
    { minTemp: 55,  color: '#8DEE31' },
    { minTemp: 60,  color: '#AAF224' },
    { minTemp: 65,  color: '#C6F718' },
    { minTemp: 70,  color: '#E2FB0C' },
    { minTemp: 75,  color: '#FFBF00' },
    { minTemp: 80,  color: '#FF9F00' },
    { minTemp: 85,  color: '#FF7F00' },
    { minTemp: 90,  color: '#FF5F00' },
    { minTemp: 95,  color: '#FF4000' },
    { minTemp: 100, color: '#FF1F00' },
    { minTemp: 105, color: '#B20000' },
];

export const daysOfWeek = d3.scaleOrdinal()
    .domain([0, 1, 2, 3, 4, 5, 6])
    .range(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);

export const monthNames = d3.scaleOrdinal()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    .range(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
