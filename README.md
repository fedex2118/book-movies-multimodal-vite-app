# Exploring Multimodal Interaction in a Movie Booking Web App: Gesture, Voice, and Traditional Input

For the frontend is required React Vite with Javascript with the following dependencies:

- npm create vite@latest my-tfjs-app
- node   v24.1.0

- @mediapipe/drawing_utils
- @mediapipe/hands 
- @mediapipe/camera_utils

- npm install -D tailwindcss@3 postcss autoprefixer -> npx tailwindcss init -p -> tailwind config.js -> index.css

- npm install @mediapipe/tasks-vision

- npm install @tensorflow/tfjs @tensorflow/tfjs-tflite   -> install this version "@tensorflow/tfjs-tflite": "^0.0.1-alpha.6"
- npm install @tensorflow/tfjs-backend-wasm

because of "@tensorflow/tfjs-tflite": "^0.0.1-alpha.6" use legacy peer deps to install correctly speech recognition

- npm install react-speech-recognition --legacy-peer-deps
- npm install prop-types --legacy-peer-deps

use the command "npm run dev" to run React

# Backend
For the back end see folder is preffered to have a conda environment setup
See folder "movies-backend" and install the following dependencies:

- pip install flask
- pip install python-dotenv
- conda install -c conda-forge flask-sqlalchemy
- pip install PyMySQL
- pip install flask-cors

once on your conda envirnoment run with python main.py

# Gesture recognition model
The current gesture recongition model was made with the colab code that you can find in this repository.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
