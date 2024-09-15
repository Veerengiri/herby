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
let API_KEY = 'AIzaSyDMdyFubIT81nN2UZL4F1YozjIxj_tdQw8';

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
  // let promptInput = `Identify the plant, flowers, trees, leaf, fruit, or vegetables in the given image with the following details (do not mention AI, act as a professional in this field). Please ensure the information is presented concisely, in easy-to-understand language, suitable for both medical professionals and the general public. Focus on accuracy and comprehensiveness. Provide the following details: Scientific Name: Provide the plant's scientific name. Common Name: Mention the most common names used for this plant in the regions where it grows. Medicinal Uses: List the primary medicinal uses or benefits of the plant, ensuring detailed, accurate, and up-to-date information. Description: A brief description of the plant's appearance, including leaf shape, flower characteristics, color, and any distinctive features. Geographical Distribution: Specify the regions or climates where this plant is commonly found. Growth Requirements: Include the plant’s light, water, soil, and temperature needs for optimal growth. Success Ratio: Indicate the success ratio of growing this plant in different climates and soil types. Safety Information: Include any known precautions or contraindications when using this plant for medicinal purposes. Accuracy: Provide an accuracy rating (from 1 to 100) for the information, based on reliable sources and consistency of the data. Additional Info: Include any important additional information relevant to the plant. Use clear, concise language, and structure the response so that the same question will always return consistent information. Say no to any unrelated questions or requests.
  // And Note that You are explaining this thing to ${profesion} and give output accroding so that they can understand like for example for the researcher you can give output in details and scientific terms
  // `

  // let promptInput = `

  // "Identify the plant (which could be a whole plant, leaf, flower, tree, or fruit) in the given image and provide details based on the selected user type: Normal Person, Researcher, or Farmer.
  // Here Person is ${profesion} so ignore any other type of role....
  // ### For Normal Person:
  // 1. **Scientific Name**: Provide the plant's scientific name.
  // 2. **Common Name**: Mention the most common names used for this plant.
  // 3. **Medicinal Uses**: Briefly list the primary medicinal uses or benefits of the plant.
  // 4. **Description**: Give a brief, simple description of the plant’s appearance, including leaf shape, flower characteristics, color, and distinctive features.
  // 5. **Care Instructions**: Offer basic care instructions for growing the plant (watering, sunlight, etc.).
  // 6. **Safety Information**: Mention any important precautions or risks when using the plant medicinally.

  // ### For Researcher:
  // 1. **Scientific Name**: Provide the accurate scientific classification of the plant, including genus and species.
  // 2. **Medicinal Uses**: Detail the plant's uses in both traditional and modern medicine, citing studies or sources where possible.
  // 3. **Phytochemistry**: Include information on the plant’s active compounds and their medicinal properties.
  // 4. **Geographical Distribution**: Specify the plant’s native regions, habitats, and the climates where it thrives.
  // 5. **Safety and Toxicology**: Provide detailed safety information, including known toxicity levels, contraindications, and side effects.
  // 6. **References**: Provide academic or peer-reviewed sources for further reading.

  // ### For Farmer:
  // 1. **Scientific and Common Name**: Provide both the scientific name and the most common local names.
  // 2. **Medicinal and Agricultural Uses**: Explain any medicinal uses and practical agricultural applications of the plant.
  // 3. **Growing Conditions**: Include information on soil types, watering needs, sunlight exposure, and suitable climates for optimal growth.
  // 4. **Pest and Disease Management**: List common pests or diseases that affect the plant, and suggest organic or chemical treatments.
  // 5. **Economic Importance**: Mention any commercial value the plant may have (e.g., as a crop, herbal remedy, or ornamental plant).
  // 6. **Safety Information**: List precautions for handling or cultivating the plant, especially regarding livestock or human consumption.


  // `

  // let promptInput = `

  // Identify the plant in the image and provide a detailed breakdown of the following information, presented professionally and clearly without mentioning AI. Ensure the response is concise and easily understandable, with special attention to the medicinal properties and care instructions.
  // And provide information in the way that you are telling it to the ${profesion}.

  // Plant Identification: Start with a brief identification of the plant, including the common name, scientific name, family, and origin of the plant.
  // Characteristics: Describe the plant’s physical characteristics, including leaf shape, flower color, height, aroma, and any distinctive features.
  // Cultural and Religious Importance (if applicable): Mention if the plant has any significant cultural, religious, or historical importance.
  // Medicinal and Health Benefits: Focus on the medicinal properties and health benefits of the plant, listing specific uses such as immunity boosting, digestive aid, etc.
  // Care Instructions: Provide guidance on how to care for the plant, including light, watering, soil preferences, temperature needs, fertilization, and pruning recommendations.
  // Propagation: Explain how the plant can be propagated (e.g., by seeds or cuttings).
  // Pests and Problems: Mention any common pests or issues the plant may face, along with preventive measures.
  // Safety Information: Include any known precautions or contraindications related to the plant's medicinal use.
  // Additional Info (if necessary): Provide any further information that may be important or relevant.
  // Make sure to give a clear and structured response that provides accurate information on the plant and its uses."


  // Example response (for Tulsi/Holy Basil):

  // The plant in the image appears to be Tulsi (also known as Holy Basil, Ocimum tenuiflorum or Ocimum sanctum), a sacred herb in Hindu culture widely grown in India and Southeast Asia. Let's break down the key information:

  // Plant Identification:

  // Common Name: Tulsi, Holy Basil
  // Scientific Name: Ocimum tenuiflorum / Ocimum sanctum
  // Family: Lamiaceae (Mint family)
  // Origin: Native to the Indian subcontinent
  // Characteristics:

  // Leaves: Bright green, oval leaves with serrated edges, aromatic.
  // Height: Typically 1-3 feet tall.
  // Flowers: Small, purplish or white, in clusters along a central stem.
  // Aroma: Strong fragrance due to essential oils like eugenol.
  // Cultural and Religious Importance: Tulsi is considered sacred in Hindu culture and is often grown in homes and temples. It’s used in Ayurveda as an "elixir of life."

  // Medicinal and Health Benefits:

  // Immunity Booster: Helps in boosting immunity and reducing stress.
  // Respiratory Relief: Eases colds, coughs, and asthma.
  // Anti-inflammatory: Reduces inflammation.
  // Antioxidant: Detoxifies the body and fights free radicals.
  // Digestion Aid: Promotes healthy digestion.
  // Care Instructions:

  // Light: Needs full sunlight for at least 4-6 hours daily.
  // Watering: Regular, but avoid waterlogging; prefers well-draining soil.
  // Soil: Loamy, well-drained soil with good organic content.
  // Temperature: Thrives in warm climates; protect from frost.
  // Fertilization: Once a month during the growing season.
  // Pruning: Prune regularly for bushier growth.
  // Propagation:

  // Propagate by seeds or cuttings. Seeds should be sown in moist soil, and cuttings can be placed in water or moist soil until rooted.
  // Pests and Problems: Susceptible to aphids, whiteflies, and fungal issues in humid conditions. Ensure good air circulation and avoid overwatering.
  // `
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
    
    
    
    const API_KEY_PLANT = 'Iyrdttzu4cqeTWJlWdyliXzz93vp7gTWb6oKDopu95B2P3JvAW';
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
    
    let promptInput = `
    Give me output for ${profesion} and ignore other professions
    For a Normal Person:
    Prompt:
    "Assuming that the plant is ${plantName}, generate a short, easy-to-understand description about the plant for a general audience. Focus on common uses, appearance, and any interesting facts about the plant. Avoid technical terms and keep the language simple."
    
    For a Farmer:
    Prompt:
    "Assuming that the plant is ${plantName}, generate a detailed description for a farmer. Focus on how to cultivate the plant, the best growing conditions, soil requirements, pest control, and any tips for maximizing yield. Provide practical information that will help the farmer understand how to grow and care for this plant."
    
    For a Researcher:
    Prompt:
    "Assuming that the plant is ${plantName}, generate a detailed, scientific description for a researcher. Focus on the plant’s taxonomy, biological characteristics, medicinal properties (if applicable), potential for further study, and any relevant research findings. Include specific scientific terms and data that would be useful for research purposes."
    
    `
    
    // Helper function to convert image to Base64
    // function convertImageToBase64(imagePath) {
      //   return new Promise((resolve, reject) => {
        //     fs.readFile(imagePath, { encoding: 'base64' }, (err, data) => {
          //       if (err) {
    //         reject(err);
    //       } else {
    //         resolve(data);
    //       }
    //     });
    //   });
    // }

    // Call the function with your image path


    // Assemble the prompt by combining the text with the chosen image
    let contents = [
      {
        role: 'user',
        parts: [
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