let betaCoefficients = []; // Array to store beta coefficients
let s0 = []; // Base survival function (s0)
let timePoints = []; // Time points for the survival function

window.onload = function () {
    updateVariableInputs();
    loadModelData(); // Load model-specific data on page load
};

// Function to load model-specific data for beta coefficients
async function loadModelData() {
    const modelFilePath = 'https://raw.githubusercontent.com/Vince-Jin/testbin/refs/heads/main/test4/assets/csv/model1_overall.csv';

    try {
        console.log('Loading model data from:', modelFilePath);

        const data = await fetchCSV(modelFilePath);

        if (data.length === 0) {
            console.error(`Error: No data found in ${modelFilePath}`);
            return;
        }

        const [header, ...rows] = data;

        // Use the 4th column for beta coefficients
        betaCoefficients = rows.map(row => {
            const cols = row.split(',');
            return parseFloat(cols[3]); // Use the 4th column
        });

        console.log('Loaded Beta Coefficients:', betaCoefficients);

        // Load survival function data (s0) and time points from s0.csv
        await loadSurvivalData(); // Call function to load s0.csv
    } catch (error) {
        console.error(`Error loading model data from ${modelFilePath}:`, error);
    }
}

// Function to load survival data from s0.csv for s0 and timePoints
async function loadSurvivalData() {
    const survivalFilePath = 'https://raw.githubusercontent.com/Vince-Jin/testbin/refs/heads/main/test4/assets/csv/s0.csv';

    try {
        console.log('Loading survival data from:', survivalFilePath);

        const data = await fetchCSV(survivalFilePath);

        

        if (data.length === 0) {
            console.error(`Error: No data found in ${survivalFilePath}`);
            return;
        }

        const [header, ...rows] = data;

        // Use the 1st column for timePoints and 2nd column for s0
        timePoints = rows.map(row => parseFloat(row.split(',')[0])); // Use the 1st column
        s0 = rows.map(row => parseFloat(row.split(',')[1])); // Use the 2nd column

        console.log('Loaded survival data:', { timePoints, s0 });
    } catch (error) {
        console.error(`Error loading survival data from ${survivalFilePath}:`, error);
    }
}

// Example fetchCSV utility to load the CSV file
async function fetchCSV(filePath) {
    try {
        const response = await fetch(filePath);
        const text = await response.text();
        return text.trim().split('\n');
    } catch (error) {
        console.error(`Error fetching CSV from ${filePath}:`, error);
        return [];
    }
}

// Function to calculate risk (example implementation)
function calculateRisk() {
    // Example risk calculation logic
    console.log('Calculating risk...');
    // Use betaCoefficients, s0, and timePoints to calculate risk
    // Adjust f0 by the logHR to calculate the risk
    const logHR = scenarioVector.reduce((acc, value, index) => acc + value * betaCoefficients[index], 0);
    const f0 = s0.map(s => (1 - s)); // Convert survival probability to mortality risk
    const f1help = f0.map((f, index) => Math.min(f * Math.exp(logHR), 1)); // Apply logHR to adjust risk
    console.log('f1help:', f1help);
    const f1 = f1help.map((f, index) => f * 100); // Apply logHR to adjust risk
    console.log('f1:', f1);

    const sortedData = timePoints.map((time, index) => ({ time, risk: f1[index] }))
        .sort((a, b) => a.time - b.time); // Sort by time

    const sortedTimePoints = sortedData.map(item => item.time);
    const sortedF1 = sortedData.map(item => item.risk);

     // Use Plotly.js to create the plot
     const data = [
        {
            x: sortedTimePoints,
            y: sortedF1,
            mode: 'lines',
            line: { color: 'navy' },
            name: 'General Population Mortality Risk'
        }
     ];

     const layout = {
        title: 'Hospitalization Risk Over Time',
        xaxis: {
            title: 'Time (years)',
            showgrid: true,
            dtick: 1 // Set tick interval to every 10 units
        },
        yaxis: {
            title: 'Hospitalization Risk (%)',
            range: [0, ],
            showgrid: true
        }
    };

    // Plotly rendering with error handling
    Plotly.newPlot('hospitalization-risk-graph', data, layout).catch(error => {
        console.error('Plotly Error:', error);
    });
}
