import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import Base64 from 'base64-js';
import fs from 'fs';
import axios from "axios";
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from './gemini-api-banner';
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const captureButton = document.getElementById('captureButton');
const opencambtn = document.getElementById('opencambtn');
const opencam = document.getElementById('opencam');
import './style.css';

// 🔥🔥 FILL THIS OUT FIRST! 🔥🔥
// Get your Gemini API key by:
// - Selecting "Add Gemini API" in the "Project IDX" panel in the sidebar
// - Or by visiting https://g.co/ai/idxGetGeminiKey
let API_KEY = 'AIzaSyD-7cHyXiob3fr0F776RxDXfRjmt56qFKA';
// AIzaSyD-7cHyXiob3fr0F776RxDXfRjmt56qFKA
let form = document.querySelector('form');
let profesion = "Normal"
// let promptInput = "Please provide detailed information about the medicinal plant based on the image or scan provided.The information should include the followingname of the plant.Common name(s) of the plant.The region(s) or countries where the plant is primarily found and grows.The success ratio of the plant’s growth in different climates and soil types.The growth requirements for the plant, including light, water, soil type, and temperature.Detailed and accurate medicinal information of the plant, including its uses in traditional or modern medicine, the specific ailments it treats, and any known side effects or precautions.This section should be comprehensive and based on reliable sources.The accuracy level of the information provided by the sources on a scale of 1 to 100, with 1 being highly uncertain and 100 being highly accurate.Base this accuracy on the reliability and consistency of the information provided by the sources.Make sure to present the information in a structured format, ensuring that the same question yields the same structured information every time."
let output = document.querySelector('.output');


function OpenCamera() {
  document.getElementById('opencam').style.display = "block"
  // alert("HI");
  // avigator.mediaDevices.getUserMedia({ video: true })
  //   .then(stream => {
  //     video.srcObject = stream;
  //   })
  //   .catch(err => {
  //     console.error('Error accessing camera:', err);
  // });
  // captureButton.addEventListener('click', () => {
  //   canvas.width = video.videoWidth;
  //   canvas.height = video.videoHeight;
  //   context.drawImage(video, 0, 0, canvas.width, canvas.height);
  //   const imageData = canvas.toDataURL('image/png');
  //   // Store image data in a variable
  //   const fileVariable = imageData; 
  //   // You can now use fileVariable (which contains the image data)
  //   // For example, send it to a server or trigger a download
  //   console.log(fileVariable); // Log the image data to the console
  // });
}
opencambtn.addEventListener('click', OpenCamera)


// const radioButtons = document.querySelectorAll('input[name="role"]');
function consoleHello() {
  alert("heloo");
}
function OnProfessionChange(pn) {
  profesion = pn;
  document.getElementById("testcase").innerHTML = pn
}
function previewImage() {
  const fileInput = document.getElementById('fileInput');
  const previewImage = document.getElementById('previewImage');

  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImage.src = e.target.result;
      previewImage.style.display = 'block'; // Show the image preview
    };
    reader.readAsDataURL(file);
  }
}

function getSelectedRole() {
  const radioButtons = document.querySelectorAll('input[name="role"]');
  for (let i = 0; i < radioButtons.length; i++) {
    if (radioButtons[i].checked) {
      profesion = radioButtons[i].value;
      break;
    }
  }
}

document.getElementById('fileInput').addEventListener('change', function (event) {
  const file = event.target.files[0]; // Get the selected file

  if (file) {
    const reader = new FileReader(); // Create a FileReader object

    // Set an onload function to run once the file is read
    reader.onload = function (e) {
      const previewImage = document.getElementById('previewImage'); // Get the image element
      previewImage.src = e.target.result; // Set the image source to the file's data URL
      previewImage.style.display = 'block'; // Make the image visible
    };

    reader.readAsDataURL(file); // Read the file as a data URL
  }
});

form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = 'Analyze...';
  getSelectedRole();

  try {
    // Load the image as a base64 string
    
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    // let imageUrl = form.elements.namedItem('chosen-image').value;
    // let imageBase64 = await fetch(imageUrl)
    //   .then(r => r.arrayBuffer())
    //   .then(a => Base64.fromByteArray(new Uint8Array(a)));

    const imageBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String)
      }
      reader.onerror = error => reject(error);
    })
    
    // plant id
    
    
    
    const API_KEY_PLANT = 'YQFC8hrChgDjnaEiU3SQFsk7ItUXXhSnmiJWrWpwSJjT86FfUf';
    const apiUrl = 'https://api.plant.id/v3/identification';
    let plantName = "";
    // Function to identify a plant from an image
    async function identifyPlant(imageBase64) {
      // const imageBase64 = await convertImageToBase64(imagePath);
      
      const requestBody = {
        images: [imageBase64],
        latitude: 49.207,
        longitude: 16.608,
        similar_images: true
      };
      const buttonElement = document.getElementById("analyze-button");
      const probElement = document.getElementById("probability")
      try {
        const response = await axios.post(apiUrl, requestBody, {
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': API_KEY_PLANT
          },
        });
           
        // console.log('Plant identification result:', response.data);
        probElement.innerText = response.data.result.is_plant.probability;
        plantName = JSON.stringify(response.data?.result?.classification?.suggestions[0]?.name);
        // buttonElement.innerText = (JSON.stringify(response.data?.result?.classification?.suggestions[0]?.name));
        // buttonElement.innerText = (JSON.stringify(response.data));
      } catch (error) {
        buttonElement.innerText = error;
        console.error('Error identifying the plant:', error);
      }
    }
    
    await identifyPlant(imageBase64);
    
    let promptInput  = `
    Apply the Prompt only for the ${profesion} User
    
    1. Prompt for Default User:
    This version is designed for the average user, so the information is kept concise and user-friendly.
    
    Prompt:
    
    "Assume the plant is ${plantName} and provide easy-to-understand information. Focus on practical and useful details for someone interested in the plant for general purposes. Avoid using complex or scientific language. Include the following details:
    
    Common Name and Scientific Name: What is the plant commonly called, and what is its scientific name?
    Medicinal Uses: Share the most important medicinal benefits of the plant in simple terms.
    Physical Description: Briefly describe how the plant looks (e.g., leaf shape, color, height).
    Where It Grows: Mention the main regions or areas where this plant is commonly found.
    How to Grow It: Give basic tips for growing the plant, including sunlight, water, and soil needs.
    Precautions: Mention any safety or health precautions one should know when using the plant for medicinal purposes.
    Make sure the response is short and easy to follow, with practical information."
    
    2. Prompt for Farmer:
    This version includes more detailed care instructions and practical growing advice, as a farmer would need more technical information to cultivate the plant effectively.
    
    Prompt:
    
    "Assume the plant is ${plantName} and provide detailed, farmer-friendly information. Focus on giving practical advice for growing, maintaining, and using the plant. Use simple language but include technical growing tips.
    
    Common and Scientific Name: What is the plant commonly called, and what is its scientific name?
    Medicinal and Agricultural Uses: Provide details about the plant's benefits, both medicinal and agricultural.
    Description of the Plant: Describe the plant's appearance (e.g., leaf shape, height, flower color), especially focusing on what a farmer needs to know to identify it in the field.
    Where It Grows Best: Explain the regions, climates, and soil types where this plant grows well.
    Care and Growing Instructions: Give detailed instructions on how to grow the plant, including its water, sunlight, temperature, soil, and fertilizer needs.
    Success Ratio: Mention how successful this plant is likely to grow under different conditions.
    Pest and Disease Management: Give advice on how to protect the plant from pests and diseases common in farming environments.
    Safety Information: Share any important safety or health precautions when using the plant, especially if it's being used for medicinal purposes or sold.
    Make sure the response is easy to follow and focuses on practical agricultural advice for farmers."
    
    3. Prompt for Researcher:
    This version includes in-depth, technical details to support a researcher's need for comprehensive data. It includes more scientific references, specific properties, and growth information.
    
    Prompt:
    
    "Assume the plant is ${plantName} and provide a detailed, research-focused response. The information should be thorough, scientifically accurate, and supported by references. Use precise terminology, and make sure to cover any relevant aspects for further study.
    
    Scientific and Common Name: Provide the plant's scientific name, taxonomic classification, and common names used globally and regionally.
    Medicinal Properties: Give detailed information on the medicinal benefits of the plant, including its bioactive compounds, traditional uses, and any clinical research or studies available.
    Botanical Description: Provide an in-depth description of the plant's morphological features (e.g., leaf arrangement, stem type, flower structure), focusing on scientific accuracy.
    Geographical Distribution and Ecological Range: Specify the plant's native regions, its adaptability to different climates, and any ecological impact it may have.
    Growth Requirements and Success Ratio: Include comprehensive data on optimal growing conditions (e.g., pH levels, soil composition, temperature ranges), success rates in various climates, and any known limitations to its cultivation.
    Propagation and Growth Cycle: Explain the reproductive methods (e.g., seed germination, cuttings), growth cycles, and any relevant research on its propagation efficiency.
    Chemical Composition: Provide details about the plant's chemical makeup, active compounds, and any potential pharmaceutical applications.
    Pests, Diseases, and Biological Challenges: Share any detailed studies or research on pests, diseases, and biological challenges the plant might face in different environments.
    Safety and Toxicity Information: Discuss any known toxicity, side effects, or contraindications, particularly from a clinical or pharmacological perspective.
    References and Studies: Include any relevant academic or scientific references for further research.
    Ensure the response is well-structured, scientifically accurate, and suitable for academic or research purposes."
    `
    let contents = [
      {
        role: 'user',
        parts: [
          { text: promptInput }
        ]
      }
    ];

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // or gemini-1.5-pro
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const result = await model.generateContentStream({ contents });

    let buffer = [];
    let md = new MarkdownIt();
    for await (let response of result.stream) {
      buffer.push(response.text());
      output.innerHTML = md.render(buffer.join(''));
    }
  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};

maybeShowApiKeyBanner(API_KEY);