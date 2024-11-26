let betaCoefficients_90day = []; // Array to store beta coefficients
let betaCoefficients2_90day = []; // Array to store the second set of beta coefficients
let s0_90day = []; // Base survival function (s0)
let s0_2_90day = []; // Second base survival function (s0_2)
let timePoints_90day = []; // Time points for the survival function
let timePoints2_90day = []; // Second set of time points for the survival function

// Function to load model-specific data (model1 or model2) for beta coefficients
async function loadModelData(modelName) {
    try {
        const modelFilePath = modelName === 'model1'
            ? 'https://raw.githubusercontent.com/Vince-Jin/testbin/refs/heads/main/test2/assets/csv/model1.csv'
            : 'https://raw.githubusercontent.com/Vince-Jin/testbin/refs/heads/main/test2/assets/csv/model2.csv';

        const data = await fetchCSV(modelFilePath);

        if (data.length === 0) {
            console.error(`Error: No data found in ${modelFilePath}`);
            return;
        }

        const [header, ...rows] = data;

        // Use the 4th column for beta coefficients
        betaCoefficients_90day = rows.map(row => {
            const cols = row.split(',');
            return parseFloat(cols[3]); // Use the 4th column
        });

        console.log(`Loaded ${modelName} Beta Coefficients:`, betaCoefficients_90day);

        // Load the second set of beta coefficients (betaCoefficient2)
        await loadSecondBetaCoefficients(modelName); // Call function to load betaCoefficient2

        // Load survival function data (s0) and time points from s0.csv
        await loadSurvivalData(modelName); // Call function to load s0.csv

        // Load the second set of time points (timePoints2) and s0 (s0_2)
        await loadSecondSurvivalData(modelName); // Call function to load s0_2 and timePoints2
    } catch (error) {
        console.error(`Error loading model data from ${modelName}:`, error);
    }
}

// Function to load second set of beta coefficients
async function loadSecondBetaCoefficients(modelName) {
    try {
        const betaFilePath = modelName === 'model1'
            ? 'https://raw.githubusercontent.com/Vince-Jin/testbin/refs/heads/main/test2/assets/csv/don_beta1.csv'
            : 'https://raw.githubusercontent.com/Vince-Jin/testbin/refs/heads/main/test2/assets/csv/don_beta2.csv';

        const data = await fetchCSV(betaFilePath);

        if (data.length === 0) {
            console.error(`Error: No data found in ${betaFilePath}`);
            return;
        }

        const [header, ...rows] = data;

        // Use the 2nd column for betaCoefficient2
        betaCoefficients2_90day = rows.map(row => {
            const cols = row.split(',');
            return parseFloat(cols[1]); // Use the 2nd column
        });

        console.log(`Loaded ${modelName} Beta Coefficients 2:`, betaCoefficients2_90day);
    } catch (error) {
        console.error(`Error loading second beta coefficients from ${modelName}:`, error);
    }
}

// Function to load survival data from s0.csv for s0 and timePoints
async function loadSurvivalData(modelName) {
    try {
        const survivalFilePath = modelName === 'model1'
            ? 'https://raw.githubusercontent.com/Vince-Jin/testbin/refs/heads/main/test2/assets/csv/s0_1.csv'
            : 'https://raw.githubusercontent.com/Vince-Jin/testbin/refs/heads/main/test2/assets/csv/s0_2.csv';
        
        const data = await fetchCSV(survivalFilePath);

        if (data.length === 0) {
            console.error(`Error: No data found in ${survivalFilePath}`);
            return;
        }

        const [header, ...rows] = data;

        // Use the 1st column for timePoints and 2nd column for s0
        timePoints_90day = rows.map(row => parseFloat(row.split(',')[0])); // Use the 1st column
        s0_90day = rows.map(row => parseFloat(row.split(',')[1])); // Use the 2nd column

        console.log('Loaded survival data:', { timePoints_90day, s0_90day });
    } catch (error) {
        console.error(`Error loading survival data from ${survivalFilePath}:`, error);
    }
}

// Function to load second set of survival data from don_s0.csv for timePoints2 and s0_2
async function loadSecondSurvivalData(modelName) {
    try {
        const survivalFilePath = 'https://raw.githubusercontent.com/Vince-Jin/testbin/refs/heads/main/test2/assets/csv/don_s0.csv';

        const data = await fetchCSV(survivalFilePath);

        if (data.length === 0) {
            console.error(`Error: No data found in ${survivalFilePath}`);
            return;
        }

        const [header, ...rows] = data;

        // Use the 2nd column for timePoints2 and 3rd column for s0_2
        timePoints2_90day = rows.map(row => parseFloat(row.split(',')[1])); // Use the 2nd column for timePoints2
        s0_2_90day = rows.map(row => parseFloat(row.split(',')[2])); // Use the 3rd column for s0_2

        console.log('Loaded second survival data:', { timePoints2_90day, s0_2_90day });
    } catch (error) {
        console.error(`Error loading second survival data from ${survivalFilePath}:`, error);
    }
}

// Function to calculate risk using the scenario vector
function calculateRisk() {
    // Calculate log hazard ratio (logHR) using the dot product of scenarioVector and betaCoefficients
    console.log('Beta Coefficients:', betaCoefficients_90day);
    console.log('Beta Coefficients 2:', betaCoefficients2_90day);
    console.log('senarioVector:', scenarioVector);
    console.log('senarioVector2:', scenarioVector2_90day);
    const logHR = scenarioVector.reduce((acc, value, index) => acc + value * betaCoefficients_90day[index], 0);
    const logHR2 = scenarioVector2_90day.reduce((acc, value, index) => acc + value * betaCoefficients2_90day[index], 0);
    console.log('Log Hazard Ratio (logHR):', logHR);
    console.log('Log Hazard Ratio 2 (logHR2):', logHR2);

    // Adjust f0 by the logHR to calculate the risk
    const f0 = s0_90day.map(s => (1 - s)); // Convert survival probability to mortality risk
    const f1help = f0.map((f, index) => Math.min(f * Math.exp(logHR), 100)); // Apply logHR to adjust risk
    const f1 = f1help.map((f, index) => f * 10000); // Apply logHR to adjust risk
    const f0_2 = s0_2_90day.map(s => (1 - s)); // Convert survival probability to mortality risk
    const f1help2 = f0_2.map((f, index) => Math.min(f * Math.exp(logHR2), 100)); // Apply logHR to adjust risk
    const f1_2 = f1help2.map((f, index) => f * 10000); // Apply logHR to adjust risk

    const sortedData = timePoints_90day.map((time, index) => ({ time, risk: f1[index] }))
        .sort((a, b) => a.time - b.time); // Sort by time

    const sortedTimePoints = sortedData.map(item => item.time);
    const sortedF1 = sortedData.map(item => item.risk);
    
    const sortedData2 = timePoints2_90day.map((time, index) => ({ time, risk: f1_2[index] }))
        .sort((a, b) => a.time - b.time); // Sort by time

    const sortedTimePoints2 = sortedData2.map(item => item.time);
    const sortedF1_2 = sortedData2.map(item => item.risk);

    // Use Plotly.js to create the plot
    const data = [
        {
            x: sortedTimePoints,
            y: sortedF1,
            mode: 'lines',
            line: { color: 'navy' },
            name: 'General Population Mortality Risk'
        },
        {
            x: sortedTimePoints2,
            y: sortedF1_2,
            mode: 'lines',
            line: { color: 'maroon' },
            name: 'Donor Mortality Risk'
        }
    ];

    const layout = {
        title: 'Mortality Risk Over Time',
        xaxis: {
            title: 'Time (days)',
            showgrid: true,
            dtick: 10 // Set tick interval to every 10 units
        },
        yaxis: {
            title: 'Mortality Risk (per 10,000)',
            range: [0, ],
            showgrid: true
        }
    };

    // Plotly rendering with error handling
    Plotly.newPlot('mortality-risk-graph', data, layout).catch(error => {
        console.error('Plotly Error:', error);
    });

    // Display updated scenario vector
    // displayScenarioVector();
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

// Ensure that model data and survival data are loaded when the page loads
window.onload = function () {
    const modelName = currentModel_90day === 'model1' ? 'model1' : 'model2'; // Ensure correct model name without .csv extension
    loadModelData(modelName); // Load model-specific data for beta coefficients
};