const URL = "https://teachablemachine.withgoogle.com/models/qo4ZvCU-o/"; // Замініть на шлях до вашої моделі

async function createModel() {
    const checkpointURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    const recognizer = speechCommands.create(
        "BROWSER_FFT",
        undefined,
        checkpointURL,
        metadataURL
    );

    await recognizer.ensureModelLoaded();
    return recognizer;
}

let recognizer;

async function init() {
    recognizer = await createModel();
    const classLabels = recognizer.wordLabels();
    const labelContainer = document.getElementById("label-container");
    for (let i = 0; i < classLabels.length; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

document.getElementById("startButton").addEventListener("click", () => {
    if (recognizer && !recognizer.isListening()) { 
        recognizer.listen(result => {
            const scores = result.scores;
            const classLabels = recognizer.wordLabels();

            let topScore = 0;
            let topLabel = "Фоновий шум";

            for (let i = 0; i < classLabels.length; i++) {
                const scorePercent = (scores[i] * 100).toFixed(2); 
                if (scorePercent > topScore && scorePercent > 80) { 
                    topScore = scorePercent;
                    topLabel = classLabels[i];
                }

                const classPrediction = classLabels[i] + ": " + scorePercent + "%"; 
                document.getElementById("label-container").childNodes[i].innerHTML = classPrediction;
            }

            document.getElementById("topLabel").innerHTML = topLabel + " (" + topScore + "%)"; 
        }, {
            includeSpectrogram: true,
            probabilityThreshold: 0.75, 
            invokeCallbackOnNoiseAndUnknown: true,
            overlapFactor: 0.50
        });
        document.getElementById("resetButton").disabled = false;
    } else {
        init(); 
    }
});

document.getElementById("resetButton").addEventListener("click", () => {
    document.getElementById("label-container").innerHTML = "";
    document.getElementById("topLabel").innerHTML = "";
    document.getElementById("resetButton").disabled = true;
    if (recognizer && recognizer.isListening()) { 
        recognizer.stopListening();
    }
});
