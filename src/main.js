import 'babel-polyfill'
import * as faceapi from 'face-api.js'

const main = async () => {
  const emotionText = {
    'happy': '😁',
    'sad': '😢',
    'angry': '😡',
    'disgusted': '🤮',
    'surprised': '😱',
    'fearful': '😨',
    'neutral': '😐'
  }
  const videoContainer = document.querySelector('.js-video')
  const canvas = document.querySelector('.js-canvas')
  const currentEmotionContainer = document.querySelector('.current-emotion')
  const context = canvas.getContext('2d')
  const video = await navigator.mediaDevices.getUserMedia({ video: true })
  const glasses = new Image();
  let faceX = 0;
  let faceY = 0;
  let faceWidth = 100;
  let faceHeight = 100;
  let glassProportion = 1;
  let emotion;
  
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
  await faceapi.nets.faceExpressionNet.loadFromUri('/models')
  glasses.addEventListener('load', () => glassProportion = glasses.width / glasses.height)

  glasses.src = "/glasses.png"
  videoContainer.srcObject = video

  const reDraw = async () => {
    context.drawImage(videoContainer, 0, 0, 640, 480)
    context.drawImage(glasses, faceX-180, faceY+110, faceWidth+350, faceHeight+250)

    requestAnimationFrame(reDraw)
  }

  const processFace = async () => {
    const detection = await faceapi.detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()
    if(typeof detection === 'undefined') return;
    const { x, y, width, height } = detection.detection.box
    faceX = x;
    faceY = y;
    faceHeight = height;
    faceWidth = width;

    emotion = Object.keys(detection.expressions).reduce((acc, current) => {
      if(acc === null || detection.expressions[acc] < detection.expressions[current]) return current
      return acc
    }, null)

    currentEmotionContainer.innerText = emotionText[emotion]
  }

  setInterval(processFace, 100)

  requestAnimationFrame(reDraw)
}

main()