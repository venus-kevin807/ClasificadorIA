const URL = "./model/";
let model, webcam, labelContainer, maxPredictions;

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  webcam = new tmImage.Webcam(224, 224, true); // tamaño de cámara
  await webcam.setup(); // configuración de cámara
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);

  // Ordenar por mayor probabilidad
  prediction.sort((a, b) => b.probability - a.probability);
  const clase = prediction[0].className;
  const probabilidad = prediction[0].probability;
  const porcentaje = (probabilidad * 100).toFixed(2);

  // Limpiar contenido
  labelContainer.innerHTML = "";

  if (probabilidad >= 0.75) {
    let mensaje = "";

    if (clase.includes("Verde")) {
      mensaje = `✅ Este residuo debe ir en la 🟢 <strong>Caneca Verde</strong> (Orgánicos aprovechables).`;
    } else if (clase.includes("Blanca")) {
      mensaje = `♻️ Este residuo debe ir en la ⚪ <strong>Caneca Blanca</strong> (Reciclables).`;
    } else if (clase.includes("Negra")) {
      mensaje = `⚠️ Este residuo debe ir en la ⚫ <strong>Caneca Negra</strong> (No aprovechables).`;
    } else {
      mensaje = `Deposite en la caneca: ${clase}`;
    }

    labelContainer.innerHTML = `
      ${mensaje}<br><br>
      <strong>Confianza:</strong> ${porcentaje}%`;
  } else {
    labelContainer.innerHTML = `🔎 Analizando residuo...<br><br><strong>Confianza:</strong> ${porcentaje}%`;
  }
}

init();
