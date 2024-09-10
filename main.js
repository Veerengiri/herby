import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import Base64 from 'base64-js';
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from './gemini-api-banner';
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const captureButton = document.getElementById('captureButton');
const opencam = document.getElementById('opencam');
import './style.css';

// 🔥🔥 FILL THIS OUT FIRST! 🔥🔥
// Get your Gemini API key by:
// - Selecting "Add Gemini API" in the "Project IDX" panel in the sidebar
// - Or by visiting https://g.co/ai/idxGetGeminiKey
let API_KEY = 'AIzaSyDMdyFubIT81nN2UZL4F1YozjIxj_tdQw8';

let form = document.querySelector('form');
let profesion= "Normal"
// let promptInput = "Please provide detailed information about the medicinal plant based on the image or scan provided.The information should include the followingname of the plant.Common name(s) of the plant.The region(s) or countries where the plant is primarily found and grows.The success ratio of the plant’s growth in different climates and soil types.The growth requirements for the plant, including light, water, soil type, and temperature.Detailed and accurate medicinal information of the plant, including its uses in traditional or modern medicine, the specific ailments it treats, and any known side effects or precautions.This section should be comprehensive and based on reliable sources.The accuracy level of the information provided by the sources on a scale of 1 to 100, with 1 being highly uncertain and 100 being highly accurate.Base this accuracy on the reliability and consistency of the information provided by the sources.Make sure to present the information in a structured format, ensuring that the same question yields the same structured information every time."
let output = document.querySelector('.output');

function OpenCamera(){
  opencam.style.display="block"
  avigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      console.error('Error accessing camera:', err);
  });
  captureButton.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/png');
    // Store image data in a variable
    const fileVariable = imageData; 
    // You can now use fileVariable (which contains the image data)
    // For example, send it to a server or trigger a download
    console.log(fileVariable); // Log the image data to the console
  });
}



// const radioButtons = document.querySelectorAll('input[name="role"]');
function consoleHello(){
  alert("heloo");
}
function OnProfessionChange(pn){
  profesion=pn;
  document.getElementById("testcase").innerHTML=pn
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
  for(let i=0; i<radioButtons.length; i++){
    if(radioButtons[i].checked){
      profesion=radioButtons[i].value;
      break;
    }
  }
}

document.getElementById('fileInput').addEventListener('change', function(event) {
  const file = event.target.files[0]; // Get the selected file
  
  if (file) {
      const reader = new FileReader(); // Create a FileReader object
      
      // Set an onload function to run once the file is read
      reader.onload = function(e) {
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
    let promptInput = `Identify the plant,flowers,trees,leaf,fruit,vegetables in the given image with the following details (dont's show in answer that you are AI, act as professional in this field) 1.Scientific Name: Provide the plant's scientific name. 2.Common Name: Mention the most common names used for this plant where it is grow. 3.Medicinal Uses: List the primary medicinal uses or benefits of the plant. 4.Description a brief description of the plant's appearance, including leaf shape, flower characteristics, color, and any distinctive features. 5.Geographical Distribution: Specify the regions or climates where this plant is commonly found. 6.Safety Information: Include any known pre cautions or contraindications when using this plant for medicinal purposes. 7.References: If available, provide references or sources where more information can be found about this plant. 7.also Give Additional Info If it's important 8,Accuracy: privide accuracy about this info Use clear, concise language and structure the response in a way that is easy to understand for both medical professionals and the general public. Say No about any Another things. Notice below points. 1 give information very sortly and give infomation in easy language that understandable by any ${profesion} person`
    
    try {
      // Load the image as a base64 string
      
      const fileInput = document.getElementById('fileInput');
      const  file = fileInput.files[0];

    // let imageUrl = form.elements.namedItem('chosen-image').value;
    // let imageBase64 = await fetch(imageUrl)
    //   .then(r => r.arrayBuffer())
    //   .then(a => Base64.fromByteArray(new Uint8Array(a)));

    const imageBase64 = await new Promise((resolve,reject)=>{
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String)
      }
      reader.onerror = error => reject(error);
    })
    
    // Assemble the prompt by combining the text with the chosen image
    let contents = [
      {
        role: 'user',
        parts: [
          { inline_data: { mime_type: 'image/jpeg', data: imageBase64, } },
          { text: promptInput }
        ]
      }
    ];

    // Call the multimodal model, and get a stream of results
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

    // Read from the stream and interpret the output as markdown
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

// You can delete this once you've filled out an API key
maybeShowApiKeyBanner(API_KEY);