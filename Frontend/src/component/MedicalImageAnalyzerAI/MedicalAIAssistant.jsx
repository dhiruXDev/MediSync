// import React, { useState, useRef, useEffect } from 'react';
// import { 
//   Upload, Camera, FileImage, Loader2, AlertTriangle, CheckCircle, 
//   Eye, Pill, Heart, Activity, MessageCircle, Send, Globe, 
//   UserCheck, Calendar, Star, MapPin, Phone, Clock, Bot, User
// } from 'lucide-react';
// const  GEMINI_API_KEY  = import.meta.env.VITE_GEMINI_API_KEY;
// const HUGGING_FACE_API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY;
// const GOOGLE_VISION_API_KEY = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
// const MedicalAIAssistant = () => {
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [analysisResult, setAnalysisResult] = useState(null);
//   const [dragActive, setDragActive] = useState(false);
//   const [currentLanguage, setCurrentLanguage] = useState('en');
//   const [chatMessages, setChatMessages] = useState([]);
//   const [chatInput, setChatInput] = useState('');
//   const [isChatLoading, setIsChatLoading] = useState(false);
//   const [recommendedDoctors, setRecommendedDoctors] = useState([]);
//   const [showChat, setShowChat] = useState(false);
//   const [apiError, setApiError] = useState(null);
//   const fileInputRef = useRef(null);
//   const chatEndRef = useRef(null);

//   // API Configuration (Replace with your actual API keys)
//   const API_CONFIG = {
//     // Hugging Face Inference API (Free tier available)
//     HUGGING_FACE_API_KEY: HUGGING_FACE_API_KEY, // Get from: https://huggingface.co/settings/tokens
//     HUGGING_FACE_MODEL: 'microsoft/DialoGPT-medium', // Or medical-specific model
    
//     // Google Vision API (Free monthly quota)
//     GOOGLE_VISION_API_KEY: GOOGLE_VISION_API_KEY, // Get from: https://console.cloud.google.com/
    
//     // Google Gemini API (Free tier available)
//     GOOGLE_GEMINI_API_KEY: GEMINI_API_KEY, // Get from: https://makersuite.google.com/
    
//     // OpenAI API (Pay per use)
//     OPENAI_API_KEY: 'your_openai_api_key_here' // Get from: https://platform.openai.com/api-keys
//   };

//   const languages = {
//     en: { name: 'English', flag: '🇺🇸' },
//     es: { name: 'Español', flag: '🇪🇸' },
//     fr: { name: 'Français', flag: '🇫🇷' },
//     de: { name: 'Deutsch', flag: '🇩🇪' },
//     hi: { name: 'हिंदी', flag: '🇮🇳' },
//     ar: { name: 'العربية', flag: '🇸🇦' },
//     zh: { name: '中文', flag: '🇨🇳' }
//   };

//   const translations = {
//     en: {
//       title: 'Medical AI Assistant',
//       subtitle: 'Upload a medical image for AI-powered analysis and get doctor recommendations',
//       uploadTitle: 'Upload Medical Image',
//       uploadSubtitle: 'Drag and drop your image here, or click to browse',
//       chooseFile: 'Choose File',
//       analyzeImage: 'Analyze Image',
//       analyzing: 'Analyzing...',
//       uploadNew: 'Upload New Image',
//       chatPlaceholder: 'Ask a follow-up question about your condition...',
//       send: 'Send',
//       confidence: 'Confidence',
//       priority: 'Priority',
//       symptoms: 'Observed Symptoms',
//       treatment: 'Recommended Treatment',
//       recommendations: 'Care Recommendations',
//       followUp: 'Follow-up Instructions',
//       disclaimer: 'Medical Disclaimer',
//       disclaimerText: 'This AI analysis is for informational purposes only and should not replace professional medical advice.',
//       recommendedDoctors: 'Recommended Doctors',
//       bookAppointment: 'Book Appointment',
//       viewProfile: 'View Profile',
//       chatWithAI: 'Chat with AI Assistant',
//       apiError: 'API Error',
//       configureApi: 'Please configure API keys to use real AI analysis'
//     },
//     es: {
//       title: 'Asistente Médico IA',
//       subtitle: 'Sube una imagen médica para análisis con IA y obtén recomendaciones de doctores',
//       uploadTitle: 'Subir Imagen Médica',
//       uploadSubtitle: 'Arrastra y suelta tu imagen aquí, o haz clic para navegar',
//       chooseFile: 'Elegir Archivo',
//       analyzeImage: 'Analizar Imagen',
//       analyzing: 'Analizando...',
//       uploadNew: 'Subir Nueva Imagen',
//       chatPlaceholder: 'Haz una pregunta de seguimiento sobre tu condición...',
//       send: 'Enviar',
//       confidence: 'Confianza',
//       priority: 'Prioridad',
//       symptoms: 'Síntomas Observados',
//       treatment: 'Tratamiento Recomendado',
//       recommendations: 'Recomendaciones de Cuidado',
//       followUp: 'Instrucciones de Seguimiento',
//       disclaimer: 'Descargo Médico',
//       disclaimerText: 'Este análisis de IA es solo para fines informativos y no debe reemplazar el consejo médico profesional.',
//       recommendedDoctors: 'Doctores Recomendados',
//       bookAppointment: 'Reservar Cita',
//       viewProfile: 'Ver Perfil',
//       chatWithAI: 'Chatear con Asistente IA',
//       apiError: 'Error de API',
//       configureApi: 'Por favor configura las claves API para usar análisis de IA real'
//     },
//     hi: {
//       title: 'चिकित्सा AI सहायक',
//       subtitle: 'AI-संचालित विश्लेषण के लिए एक चिकित्सा छवि अपलोड करें और डॉक्टर की सिफारिशें प्राप्त करें',
//       uploadTitle: 'चिकित्सा छवि अपलोड करें',
//       uploadSubtitle: 'अपनी छवि यहाँ खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें',
//       chooseFile: 'फ़ाइल चुनें',
//       analyzeImage: 'छवि का विश्लेषण करें',
//       analyzing: 'विश्लेषण कर रहे हैं...',
//       uploadNew: 'नई छवि अपलोड करें',
//       chatPlaceholder: 'अपनी स्थिति के बारे में एक फॉलो-अप प्रश्न पूछें...',
//       send: 'भेजें',
//       confidence: 'विश्वास',
//       priority: 'प्राथमिकता',
//       symptoms: 'देखे गए लक्षण',
//       treatment: 'अनुशंसित उपचार',
//       recommendations: 'देखभाल की सिफारिशें',
//       followUp: 'फॉलो-अप निर्देश',
//       disclaimer: 'चिकित्सा अस्वीकरण',
//       disclaimerText: 'यह AI विश्लेषण केवल सूचनात्मक उद्देश्यों के लिए है और पेशेवर चिकित्सा सलाह की जगह नहीं लेना चाहिए।',
//       recommendedDoctors: 'अनुशंसित डॉक्टर',
//       bookAppointment: 'अपॉइंटमेंट बुक करें',
//       viewProfile: 'प्रोफ़ाइल देखें',
//       chatWithAI: 'AI सहायक के साथ चैट करें',
//       apiError: 'API त्रुटि',
//       configureApi: 'कृपया वास्तविक AI विश्लेषण का उपयोग करने के लिए API कुंजी कॉन्फ़िगर करें'
//     }
//   };

//   const t = translations[currentLanguage] || translations.en;

//   // Mock doctors database
//   const mockDoctors = [
//     {
//       id: 1,
//       name: 'Dr. Sarah Johnson',
//       specialty: 'Dermatology',
//       rating: 4.9,
//       experience: '15 years',
//       hospital: 'City General Hospital',
//       availability: 'Available today',
//       location: 'Downtown Medical Center',
//       phone: '+1 (555) 123-4567',
//       languages: ['English', 'Spanish'],
//       conditions: ['skin rash', 'dermatitis', 'eczema', 'psoriasis', 'acne', 'moles']
//     },
//     {
//       id: 2,
//       name: 'Dr. Michael Chen',
//       specialty: 'Emergency Medicine',
//       rating: 4.8,
//       experience: '12 years',
//       hospital: 'Metro Emergency Center',
//       availability: 'Available now',
//       location: 'Central Hospital',
//       phone: '+1 (555) 987-6543',
//       languages: ['English', 'Mandarin'],
//       conditions: ['wound care', 'trauma', 'laceration', 'burns', 'cuts', 'bruises']
//     },
//     {
//       id: 3,
//       name: 'Dr. Priya Sharma',
//       specialty: 'Internal Medicine',
//       rating: 4.7,
//       experience: '10 years',
//       hospital: 'Advanced Care Clinic',
//       availability: 'Available tomorrow',
//       location: 'North Medical Plaza',
//       phone: '+1 (555) 456-7890',
//       languages: ['English', 'Hindi'],
//       conditions: ['general medicine', 'consultation', 'diagnosis', 'fever', 'pain']
//     },
//     {
//       id: 4,
//       name: 'Dr. Ahmed Hassan',
//       specialty: 'Orthopedics',
//       rating: 4.9,
//       experience: '18 years',
//       hospital: 'Sports Medicine Center',
//       availability: 'Available today',
//       location: 'West Medical Complex',
//       phone: '+1 (555) 321-0987',
//       languages: ['English', 'Arabic'],
//       conditions: ['fracture', 'bone', 'joint', 'muscle', 'sprain', 'dislocation']
//     }
//   ];

//   // Convert image to base64 for API calls
//   const imageToBase64 = (file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = () => resolve(reader.result.split(',')[1]);
//       reader.onerror = reject;
//       reader.readAsDataURL(file);
//     });
//   };

//   // Google Vision API - Image Analysis
//   const analyzeWithGoogleVision = async (imageFile) => {
//     try {
//       const base64Image = await imageToBase64(imageFile);
//       console.log("Anylysing image", base64Image);
//       const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${API_CONFIG.GOOGLE_VISION_API_KEY}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           requests: [{
//             image: {
//               content: base64Image
//             },
//             features: [
//               { type: 'LABEL_DETECTION', maxResults: 10 },
//               { type: 'TEXT_DETECTION', maxResults: 5 },
//               { type: 'SAFE_SEARCH_DETECTION' }
//             ]
//           }]
//         })
//       });

//       const data = await response.json();
//       console.log(" response", data);
//       return data.responses[0];
//     } catch (error) {
//       console.error('Google Vision API Error:', error);
//       throw error;
//     }
//   };

//   // Hugging Face API - Medical Analysis
//   const analyzeWithHuggingFace = async (medicalPrompt) => {
//     try {
//       const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${API_CONFIG.HUGGING_FACE_API_KEY}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           inputs: medicalPrompt,
//           parameters: {
//             max_length: 500,
//             temperature: 0.7
//           }
//         })
//       });

//       const data = await response.json();
//       return data;
//     } catch (error) {
//       console.error('Hugging Face API Error:', error);
//       throw error;
//     }
//   };

//   // OpenAI API - Enhanced Medical Analysis
//   const analyzeWithOpenAI = async (imageDescription, detectedText) => {
//     try {
//       const prompt = `You are a medical AI assistant. Based on this medical image analysis:
      
//       Image Description: ${imageDescription}
//       Detected Text: ${detectedText}
      
//       Please provide a comprehensive medical analysis in JSON format with the following structure:
//       {
//         "condition": "Primary suspected condition",
//         "confidence": "Confidence percentage (number only)",
//         "description": "Detailed description of the condition",
//         "symptoms": ["List of observed symptoms"],
//         "prescription": ["List of recommended treatments"],
//         "recommendations": ["List of care recommendations"],
//         "urgency": "low/medium/high",
//         "followUp": "Follow-up instructions",
//         "specialty": "relevant medical specialty"
//       }
      
//       Respond only with valid JSON.`;

//       const response = await fetch('https://api.openai.com/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           model: 'gpt-3.5-turbo',
//           messages: [
//             {
//               role: 'system',
//               content: 'You are a helpful medical AI assistant. Always provide safe, general medical information and remind users to consult healthcare professionals.'
//             },
//             {
//               role: 'user',
//               content: prompt
//             }
//           ],
//           max_tokens: 1000,
//           temperature: 0.3
//         })
//       });

//       const data = await response.json();
//       return JSON.parse(data.choices[0].message.content);
//     } catch (error) {
//       console.error('OpenAI API Error:', error);
//       throw error;
//     }
//   };

//   // Google Gemini API - Chat functionality
//   const chatWithGemini = async (message, context) => {
//     try {
//       const prompt = `You are a medical AI assistant. Based on the previous medical analysis context: ${JSON.stringify(context)}
      
//       User question: ${message}
      
//       Please provide a helpful, safe medical response. Always remind users to consult healthcare professionals for serious concerns.`;

//       const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_CONFIG.GOOGLE_GEMINI_API_KEY}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           contents: [{
//             parts: [{
//               text: prompt
//             }]
//           }],
//           generationConfig: {
//             temperature: 0.4,
//             topK: 32,
//             topP: 1,
//             maxOutputTokens: 1024,
//           }
//         })
//       });

//       const data = await response.json();
//       return data.candidates[0].content.parts[0].text;
//     } catch (error) {
//       console.error('Gemini API Error:', error);
//       throw error;
//     }
//   };

//   // Main AI Analysis Function
//   const analyzeImageWithAI = async (imageFile) => {
//     setIsAnalyzing(true);
//     setApiError(null);
    
//     try {
//       // Check if API keys are configured
//       const hasApiKeys = API_CONFIG.GOOGLE_VISION_API_KEY !== 'your_google_api_key_here' ||
//                         API_CONFIG.OPENAI_API_KEY !== 'your_openai_api_key_here';
      
//       if (!hasApiKeys) {
//         // Fallback to enhanced mock data for demo
//         await new Promise(resolve => setTimeout(resolve, 3000));
//         const mockResult = generateEnhancedMockAnalysis();
//         setAnalysisResult(mockResult);
//         setRecommendedDoctors(findMatchingDoctors(mockResult));
//         initializeChat(mockResult);
//         return;
//       }

//       // Step 1: Analyze image with Google Vision API
//       console.log('Analyzing image with Google Vision API...');
//       const visionResult = await analyzeWithGoogleVision(imageFile);
      
//       // Extract labels and text from Vision API
//       const labels = visionResult.labelAnnotations?.map(label => label.description).join(', ') || '';
//       const detectedText = visionResult.textAnnotations?.[0]?.description || '';
      
//       // Step 2: Get detailed medical analysis from OpenAI
//       console.log('Getting detailed analysis from OpenAI...');
//       const medicalAnalysis = await analyzeWithOpenAI(labels, detectedText);
      
//       // Set results
//       setAnalysisResult(medicalAnalysis);
//       setRecommendedDoctors(findMatchingDoctors(medicalAnalysis));
//       initializeChat(medicalAnalysis);
      
//     } catch (error) {
//       console.error('AI Analysis Error:', error);
//       setApiError(error.message);
      
//       // Fallback to enhanced mock analysis
//       const mockResult = generateEnhancedMockAnalysis();
//       setAnalysisResult(mockResult);
//       setRecommendedDoctors(findMatchingDoctors(mockResult));
//       initializeChat(mockResult);
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   // Enhanced mock analysis for demo/fallback
//   const generateEnhancedMockAnalysis = () => {
//     const conditions = [
//       {
//         condition: 'Contact Dermatitis',
//         confidence: 89,
//         description: 'Inflammatory skin condition caused by contact with allergens or irritants. The affected area shows characteristic redness and swelling patterns consistent with allergic contact dermatitis.',
//         symptoms: ['Localized redness and inflammation', 'Mild to moderate swelling', 'Itching sensation', 'Small vesicles or bumps', 'Skin irritation'],
//         prescription: [
//           'Topical corticosteroid (Hydrocortisone 1% cream) - Apply thin layer 2-3 times daily',
//           'Oral antihistamine (Cetirizine 10mg) - Once daily for itching relief',
//           'Cool compress application - 15 minutes, 3-4 times daily',
//           'Fragrance-free moisturizing lotion - Apply after each wash'
//         ],
//         recommendations: [
//           'Identify and completely avoid the triggering allergen or irritant',
//           'Keep the affected area clean and dry at all times',
//           'Apply prescribed medications exactly as directed by healthcare provider',
//           'Monitor closely for signs of secondary bacterial infection',
//           'Schedule dermatology follow-up if no improvement within 1 week',
//           'Consider patch testing to identify specific allergens'
//         ],
//         urgency: 'medium',
//         followUp: 'Follow up with dermatologist in 7-10 days if symptoms persist or worsen. Seek immediate care if signs of infection develop.',
//         specialty: 'dermatology'
//       },
//       {
//         condition: 'Minor Laceration with Good Healing',
//         confidence: 94,
//         description: 'Clean minor cut showing appropriate healing progression. Wound edges are well-approximated with no visible signs of infection or complications.',
//         symptoms: ['Clean, well-approximated wound edges', 'Minimal bleeding or discharge', 'No purulent or malodorous discharge', 'Normal skin color around wound edges'],
//         prescription: [
//           'Topical antibiotic ointment (Bacitracin or Neosporin) - Apply thin layer twice daily',
//           'Sterile adhesive bandages - Change daily or when soiled',
//           'Pain management (Ibuprofen 400mg) - As needed for discomfort',
//           'Wound cleansing solution (saline) - For daily cleaning'
//         ],
//         recommendations: [
//           'Keep wound clean, dry, and properly covered at all times',
//           'Change dressing daily or immediately if it becomes wet or soiled',
//           'Monitor closely for signs of infection (increased redness, warmth, pus, red streaking)',
//           'Avoid submerging wound in water (baths, swimming) until fully healed',
//           'Apply antibiotic ointment as directed to prevent infection',
//           'Protect wound from further trauma or injury'
//         ],
//         urgency: 'low',
//         followUp: 'Wound should heal completely within 7-14 days. Contact healthcare provider if signs of infection develop.',
//         specialty: 'emergency medicine'
//       },
//       {
//         condition: 'Possible Fracture - Requires X-ray',
//         confidence: 76,
//         description: 'Based on visible swelling and deformity, there is concern for possible bone fracture. Immediate medical evaluation and imaging are recommended.',
//         symptoms: ['Visible swelling and deformity', 'Likely pain and tenderness', 'Possible limited range of motion', 'Bruising or discoloration'],
//         prescription: [
//           'Immobilization with splint or support',
//           'Pain management (as prescribed by physician)',
//           'Ice application (20 minutes every 2-3 hours)',
//           'Elevation of affected area when possible'
//         ],
//         recommendations: [
//           'Seek immediate medical attention for proper evaluation',
//           'Obtain X-ray imaging to confirm or rule out fracture',
//           'Avoid putting weight or stress on the affected area',
//           'Follow up with orthopedic specialist if fracture is confirmed',
//           'Monitor for signs of circulation problems',
//           'Take prescribed pain medication as directed'
//         ],
//         urgency: 'high',
//         followUp: 'Immediate medical evaluation required. Visit emergency room or urgent care within 2-4 hours.',
//         specialty: 'orthopedics'
//       }
//     ];

//     return conditions[Math.floor(Math.random() * conditions.length)];
//   };

//   // Find matching doctors based on condition
//   const findMatchingDoctors = (analysis) => {
//     const matchingDoctors = mockDoctors.filter(doctor => 
//       doctor.conditions.some(condition => 
//         analysis.condition.toLowerCase().includes(condition.toLowerCase()) ||
//         analysis.specialty === doctor.specialty.toLowerCase().replace(' ', '')
//       )
//     );
    
//     return matchingDoctors.length > 0 ? matchingDoctors.slice(0, 3) : mockDoctors.slice(0, 3);
//   };

//   // Initialize chat with AI greeting
//   const initializeChat = (analysis) => {
//     setChatMessages([
//       {
//         type: 'ai',
//         message: `I've analyzed your image and identified it as ${analysis.condition} with ${analysis.confidence}% confidence. I'm here to answer any questions you have about your condition, treatment options, or care instructions. What would you like to know more about?`,
//         timestamp: new Date()
//       }
//     ]);
//   };

//   // Handle chat submission with Gemini
//   const handleChatSubmit = async (e) => {
//     e.preventDefault();
//     if (!chatInput.trim()) return;

//     const userMessage = {
//       type: 'user',
//       message: chatInput,
//       timestamp: new Date()
//     };

//     setChatMessages(prev => [...prev, userMessage]);
//     const currentInput = chatInput;
//     setChatInput('');
//     setIsChatLoading(true);

//     try {
//       // Use Gemini API if configured, otherwise use mock responses
//       let aiResponse;
      
//       if (API_CONFIG.GOOGLE_GEMINI_API_KEY !== 'your_gemini_api_key_here') {
//         aiResponse = await chatWithGemini(currentInput, analysisResult);
//       } else {
//         // Enhanced mock responses
//         const mockResponses = [
//           `Based on your ${analysisResult?.condition || 'condition'}, it's important to follow the prescribed treatment plan carefully. The symptoms should typically improve within 3-5 days with proper care and medication adherence.`,
          
//           `I recommend monitoring the affected area closely for any changes. If you notice increased redness, warmth, swelling, or any discharge, contact your healthcare provider immediately as these could be signs of complications.`,
          
//           `For pain management, over-the-counter medications like ibuprofen can help reduce both pain and inflammation. Always follow the dosage instructions on the package and don't exceed the recommended amount.`,
          
//           `The healing process varies by individual and the specific condition, but with proper care following the treatment plan, you should see gradual improvement. Keep the area clean, take medications as prescribed, and follow all care instructions.`,
          
//           `If you're experiencing any specific symptoms or have concerns about your medications, it's always best to consult directly with one of the recommended doctors. They can provide personalized advice based on your complete medical history.`,
          
//           `Make sure to attend any follow-up appointments as scheduled. Early intervention and proper monitoring are key to preventing complications and ensuring optimal healing.`
//         ];
        
//         await new Promise(resolve => setTimeout(resolve, 1500));
//         aiResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
//       }

//       const aiMessage = {
//         type: 'ai',
//         message: aiResponse,
//         timestamp: new Date()
//       };

//       setChatMessages(prev => [...prev, aiMessage]);
//     } catch (error) {
//       console.error('Chat Error:', error);
//       const errorMessage = {
//         type: 'ai',
//         message: "I'm sorry, I'm having trouble connecting to the chat service right now. Please try again in a moment, or consider contacting one of the recommended doctors directly.",
//         timestamp: new Date()
//       };
//       setChatMessages(prev => [...prev, errorMessage]);
//     } finally {
//       setIsChatLoading(false);
//     }
//   };



//   const handleImageUpload = (file) => {
//     if (file && file.type.startsWith('image/')) {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setSelectedImage({
//           file: file,
//           preview: e.target.result,
//           name: file.name
//         });
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleFileSelect = (event) => {
//     const file = event.target.files[0];
//     handleImageUpload(file);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setDragActive(false);
//     const file = e.dataTransfer.files[0];
//     handleImageUpload(file);
//   };

//   const resetAnalysis = () => {
//     setSelectedImage(null);
//     setAnalysisResult(null);
//     setChatMessages([]);
//     setRecommendedDoctors([]);
//     setShowChat(false);
//     setIsAnalyzing(false);
//     setApiError(null);
//   };

//   const getUrgencyColor = (urgency) => {
//     switch (urgency) {
//       case 'high': return 'text-red-600 bg-red-50 border-red-200';
//       case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
//       case 'low': return 'text-green-600 bg-green-50 border-green-200';
//       default: return 'text-gray-600 bg-gray-50 border-gray-200';
//     }
//   };

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [chatMessages]);

//   return (
//     <div className="min-h-screen mt-18 bg-gradient-to-br from-blue-50 via-white to-purple-50">
//       <div className="max-w-7xl mx-auto p-6">
//         {/* Header */}
//         <div className="mb-8 text-center">
//           <div className="flex justify-between items-start mb-4">
//             <div className="flex-1">
//               <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
//                 <div className="p-3 bg-blue-600 rounded-xl">
//                   <Activity className="text-white h-8 w-8" />
//                 </div>
//                 {t.title}
//               </h1>
//               <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t.subtitle}</p>
//             </div>
            
//             {/* Language Selector */}
//             <div className="relative">
//               <select
//                 value={currentLanguage}
//                 onChange={(e) => setCurrentLanguage(e.target.value)}
//                 className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
//               >
//                 {Object.entries(languages).map(([code, lang]) => (
//                   <option key={code} value={code}>
//                     {lang.flag} {lang.name}
//                   </option>
//                 ))}
//               </select>
//               <Globe className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
//             </div>
//           </div>
//         </div>

//         {/* API Configuration Notice */}
//         {apiError && (
//           <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
//             <div className="flex items-center gap-3">
//               <AlertTriangle className="h-5 w-5 text-yellow-600" />
//               <div>
//                 <h4 className="font-semibold text-yellow-900">{t.apiError}</h4>
//                 <p className="text-yellow-800 text-sm">{t.configureApi}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Analysis Section */}
//           <div className="lg:col-span-2 space-y-6">
//             {!selectedImage ? (
//               <div
//                 className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${
//                   dragActive 
//                     ? 'border-blue-400 bg-blue-50 scale-105' 
//                     : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
//                 }`}
//                 onDrop={handleDrop}
//                 onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
//                 onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
//               >
//                 <div className="flex justify-center mb-6">
//                   <div className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full">
//                     <Upload className="h-20 w-20 text-blue-600" />
//                   </div>
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-800 mb-3">{t.uploadTitle}</h3>
//                 <p className="text-gray-600 mb-8 text-lg">{t.uploadSubtitle}</p>
                
//                 <button
//                   onClick={() => fileInputRef.current?.click()}
//                   className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 gap-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
//                 >
//                   <FileImage className="h-6 w-6" />
//                   {t.chooseFile}
//                 </button>
                
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileSelect}
//                   className="hidden"
//                 />
                
//                 <p className="text-sm text-gray-500 mt-6">
//                   Supported formats: JPG, PNG, GIF (Max 10MB)
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 {/* Image Preview and Actions */}
//                 <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
//                   <div className="flex items-start gap-8">
//                     <div className="flex-shrink-0">
//                       <img
//                         src={selectedImage.preview}
//                         alt="Uploaded medical image"
//                         className="w-64 h-64 object-cover rounded-xl border-2 border-gray-200 shadow-md"
//                       />
//                     </div>
                    
//                     <div className="flex-1">
//                       <h3 className="text-xl font-bold text-gray-900 mb-4">
//                         {selectedImage.name}
//                       </h3>
                      
//                       <div className="flex gap-4">
//                         <button
//                           onClick={() => analyzeImageWithAI(selectedImage.file)}
//                           disabled={isAnalyzing}
//                           className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
//                         >
//                           {isAnalyzing ? (
//                             <>
//                               <Loader2 className="h-5 w-5 animate-spin" />
//                               {t.analyzing}
//                             </>
//                           ) : (
//                             <>
//                               <Eye className="h-5 w-5" />
//                               {t.analyzeImage}
//                             </>
//                           )}
//                         </button>
                        
//                         <button
//                           onClick={resetAnalysis}
//                           className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
//                         >
//                           {t.uploadNew}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Analysis Progress */}
//                 {isAnalyzing && (
//                   <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-8">
//                     <div className="flex items-center gap-4">
//                       <div className="p-3 bg-blue-600 rounded-full">
//                         <Loader2 className="h-8 w-8 animate-spin text-white" />
//                       </div>
//                       <div className="flex-1">
//                         <h3 className="text-xl font-bold text-blue-900">AI Analysis in Progress</h3>
//                         <p className="text-blue-700 text-lg">Using advanced AI models to examine your image...</p>
//                         <div className="mt-3 space-y-2">
//                           <div className="flex justify-between text-sm text-blue-600">
//                             <span>Google Vision API - Image Recognition</span>
//                             <span>Processing...</span>
//                           </div>
//                           <div className="w-full bg-blue-200 rounded-full h-2">
//                             <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Analysis Results */}
//                 {analysisResult && (
//                   <div className="space-y-6">
//                     {/* Main Diagnosis */}
//                     <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
//                       <div className="flex items-start justify-between mb-6">
//                         <div className="flex-1">
//                           <h2 className="text-3xl font-bold text-gray-900 mb-3">{analysisResult.condition}</h2>
//                           <div className="flex items-center gap-3 mb-4">
//                             <CheckCircle className="h-6 w-6 text-green-500" />
//                             <span className="text-lg font-semibold text-green-700">
//                               {analysisResult.confidence}% {t.confidence}
//                             </span>
//                           </div>
//                         </div>
                        
//                         <div className={`px-4 py-2 rounded-full border text-sm font-bold ${getUrgencyColor(analysisResult.urgency)}`}>
//                           {analysisResult.urgency.charAt(0).toUpperCase() + analysisResult.urgency.slice(1)} {t.priority}
//                         </div>
//                       </div>
                      
//                       <p className="text-gray-700 leading-relaxed text-lg">{analysisResult.description}</p>
//                     </div>

//                     {/* Symptoms */}
//                     <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-8">
//                       <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-3">
//                         <AlertTriangle className="h-6 w-6" />
//                         {t.symptoms}
//                       </h3>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         {analysisResult.symptoms.map((symptom, index) => (
//                           <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
//                             <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
//                             <span className="text-orange-800 font-medium">{symptom}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Treatment */}
//                     <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-8">
//                       <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-3">
//                         <Pill className="h-6 w-6" />
//                         {t.treatment}
//                       </h3>
//                       <div className="space-y-4">
//                         {analysisResult.prescription.map((treatment, index) => (
//                           <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
//                             <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
//                               {index + 1}
//                             </div>
//                             <span className="text-blue-800 font-medium text-lg">{treatment}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Care Recommendations */}
//                     <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
//                       <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-3">
//                         <Heart className="h-6 w-6" />
//                         {t.recommendations}
//                       </h3>
//                       <div className="space-y-4">
//                         {analysisResult.recommendations.map((recommendation, index) => (
//                           <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
//                             <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
//                             <span className="text-green-800 font-medium text-lg">{recommendation}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Follow-up */}
//                     <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-8">
//                       <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-3">
//                         <Clock className="h-6 w-6" />
//                         {t.followUp}
//                       </h3>
//                       <p className="text-purple-800 text-lg font-medium">{analysisResult.followUp}</p>
//                     </div>

//                     {/* Chat Toggle */}
//                     <div className="text-center">
//                       <button
//                         onClick={() => setShowChat(!showChat)}
//                         className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 gap-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
//                       >
//                         <MessageCircle className="h-6 w-6" />
//                         {t.chatWithAI}
//                       </button>
//                     </div>

//                     {/* Chat Interface */}
//                     {showChat && (
//                       <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
//                         <div className="p-6 border-b border-gray-200">
//                           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
//                             <Bot className="h-6 w-6 text-purple-600" />
//                             Medical AI Chat Assistant
//                           </h3>
//                           <p className="text-gray-600 mt-1">Ask follow-up questions about your condition</p>
//                         </div>
                        
//                         <div className="h-96 overflow-y-auto p-6 space-y-4">
//                           {chatMessages.map((message, index) => (
//                             <div key={index} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
//                               <div className={`flex gap-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
//                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                                   message.type === 'user' 
//                                     ? 'bg-blue-600 text-white' 
//                                     : 'bg-purple-600 text-white'
//                                 }`}>
//                                   {message.type === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
//                                 </div>
//                                 <div className={`p-4 rounded-xl ${
//                                   message.type === 'user'
//                                     ? 'bg-blue-600 text-white'
//                                     : 'bg-gray-100 text-gray-900'
//                                 }`}>
//                                   <p className="leading-relaxed">{message.message}</p>
//                                   <p className={`text-xs mt-2 ${
//                                     message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
//                                   }`}>
//                                     {message.timestamp.toLocaleTimeString()}
//                                   </p>
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
                          
//                           {isChatLoading && (
//                             <div className="flex gap-3 justify-start">
//                               <div className="flex gap-3 max-w-3xl">
//                                 <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
//                                   <Bot className="h-5 w-5" />
//                                 </div>
//                                 <div className="p-4 rounded-xl bg-gray-100">
//                                   <div className="flex items-center gap-2">
//                                     <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
//                                     <span className="text-gray-700">AI is thinking...</span>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           )}
//                           <div ref={chatEndRef} />
//                         </div>
                        
//                         <div className="p-6 border-t border-gray-200">
//                           <form onSubmit={handleChatSubmit} className="flex gap-3">
//                             <input
//                               type="text"
//                               value={chatInput}
//                               onChange={(e) => setChatInput(e.target.value)}
//                               placeholder={t.chatPlaceholder}
//                               className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                               disabled={isChatLoading}
//                             />
//                             <button
//                               type="submit"
//                               disabled={!chatInput.trim() || isChatLoading}
//                               className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
//                             >
//                               <Send className="h-5 w-5" />
//                               {t.send}
//                             </button>
//                           </form>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Doctor Recommendations */}
//             {recommendedDoctors.length > 0 && (
//               <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
//                   <UserCheck className="h-6 w-6 text-blue-600" />
//                   {t.recommendedDoctors}
//                 </h3>
                
//                 <div className="space-y-4">
//                   {recommendedDoctors.map((doctor) => (
//                     <div key={doctor.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
//                       <div className="flex items-start gap-3 mb-3">
//                         <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
//                           {doctor.name.charAt(3)}
//                         </div>
//                         <div className="flex-1">
//                           <h4 className="font-bold text-gray-900">{doctor.name}</h4>
//                           <p className="text-blue-600 font-medium">{doctor.specialty}</p>
//                           <div className="flex items-center gap-1 mt-1">
//                             <Star className="h-4 w-4 text-yellow-500 fill-current" />
//                             <span className="text-sm text-gray-600">{doctor.rating} • {doctor.experience}</span>
//                           </div>
//                         </div>
//                       </div>
                      
//                       <div className="space-y-2 text-sm text-gray-600 mb-3">
//                         <div className="flex items-center gap-2">
//                           <MapPin className="h-4 w-4" />
//                           <span>{doctor.hospital}</span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <Clock className="h-4 w-4" />
//                           <span className="text-green-600 font-medium">{doctor.availability}</span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <Phone className="h-4 w-4" />
//                           <span>{doctor.phone}</span>
//                         </div>
//                       </div>
                      
//                       <div className="flex gap-2">
//                         <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-1">
//                           <Calendar className="h-4 w-4" />
//                           {t.bookAppointment}
//                         </button>
//                         <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
//                           {t.viewProfile}
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* API Integration Info */}
//             <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6">
//               <h3 className="text-lg font-bold text-indigo-900 mb-3">🤖 AI Integration</h3>
//               <div className="space-y-2 text-sm text-indigo-800">
//                 <div className="flex items-center gap-2">
//                   <CheckCircle className="h-4 w-4 text-green-500" />
//                   <span>Google Vision API - Image Analysis</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <CheckCircle className="h-4 w-4 text-green-500" />
//                   <span>OpenAI GPT - Medical Analysis</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <CheckCircle className="h-4 w-4 text-green-500" />
//                   <span>Google Gemini - Chat Assistant</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <CheckCircle className="h-4 w-4 text-green-500" />
//                   <span>Hugging Face - ML Models</span>
//                 </div>
//               </div>
//               <p className="text-xs text-indigo-600 mt-3">
//                 Configure API keys in the code for full AI functionality
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Medical Disclaimer */}
//         <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
//           <div className="flex items-start gap-4">
//             <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
//             <div>
//               <h4 className="font-bold text-yellow-900 mb-2">{t.disclaimer}</h4>
//               <p className="text-yellow-800 leading-relaxed">
//                 {t.disclaimerText} This AI system is designed to provide general information and should not be used as a substitute for professional medical diagnosis, treatment, or advice. Always consult with qualified healthcare professionals for medical concerns. In case of emergency, contact your local emergency services immediately.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Camera, FileImage, Loader2, AlertTriangle, CheckCircle, 
  Eye, Pill, Heart, Activity, MessageCircle, Send, Globe, 
  UserCheck, Calendar, Star, MapPin, Phone, Clock, Bot, User
} from 'lucide-react';

const HUGGING_FACE_API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const MedicalAIAssistant = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [userDescription, setUserDescription] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [apiError, setApiError] = useState(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const mockDoctors = [
    // ... your doctor data as before
  ];

  const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeWithHuggingFace = async (description) => {
    const prompt = `You are a medical AI assistant. A user has uploaded an image and described it as: "${description}". Provide a JSON analysis with the following structure:\n\n{
      "condition": "",
      "confidence": "",
      "description": "",
      "symptoms": [],
      "prescription": [],
      "recommendations": [],
      "urgency": "low|medium|high",
      "followUp": "",
      "specialty": ""
    }`;

    try {
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
      });

      const data = await response.json();
      const parsed = JSON.parse(data.generated_text || '{}');
      return parsed;
    } catch (err) {
      console.error('HF error:', err);
      throw err;
    }
  };

  const analyzeImageWithAI = async () => {
    if (!userDescription.trim()) {
      alert('Please describe the image/symptoms before analysis.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeWithHuggingFace(userDescription);
      setAnalysisResult(result);
      setRecommendedDoctors(findMatchingDoctors(result));
      initializeChat(result);
    } catch (err) {
      const fallback = generateMockAnalysis();
      setAnalysisResult(fallback);
      setRecommendedDoctors(findMatchingDoctors(fallback));
      initializeChat(fallback);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMockAnalysis = () => {
    return {
      condition: 'Allergic Reaction',
      confidence: 87,
      description: 'Redness and swelling due to exposure to allergen.',
      symptoms: ['Red rash', 'Itching', 'Swelling'],
      prescription: ['Hydrocortisone cream', 'Antihistamine (Cetirizine)'],
      recommendations: ['Avoid allergen', 'Use cold compress'],
      urgency: 'medium',
      followUp: 'See a dermatologist in 3-5 days if symptoms persist.',
      specialty: 'dermatology'
    };
  };

  const findMatchingDoctors = (analysis) => {
    const matching = mockDoctors.filter(doc =>
      doc.conditions?.some(cond => analysis.condition?.toLowerCase().includes(cond.toLowerCase()))
    );
    return matching.length ? matching : mockDoctors.slice(0, 3);
  };

  const initializeChat = (result) => {
    setChatMessages([{
      type: 'ai',
      message: `The condition appears to be ${result.condition}. Feel free to ask questions about symptoms, treatment, or follow-up.`,
      timestamp: new Date()
    }]);
  };

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage({
          file: file,
          preview: e.target.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setChatMessages([]);
    setUserDescription('');
    setRecommendedDoctors([]);
    setShowChat(false);
    setIsAnalyzing(false);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { type: 'user', message: chatInput, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Condition: ${analysisResult.condition}. User question: ${chatInput}` }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 512 }
        })
      });

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, no reply available.';

      setChatMessages(prev => [...prev, { type: 'ai', message: reply, timestamp: new Date() }]);
    } catch (err) {
      setChatMessages(prev => [...prev, {
        type: 'ai',
        message: 'Something went wrong with AI chat.',
        timestamp: new Date()
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">Medical AI Assistant (Free Version)</h2>

      {!selectedImage ? (
        <div className="border-2 border-dashed p-10 rounded-lg text-center">
          <Upload className="w-10 h-10 mx-auto mb-4" />
          <p className="mb-4">Upload your image (for display) and describe the issue</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            Select Image
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files[0])}
            className="hidden"
            ref={fileInputRef}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <img src={selectedImage.preview} alt="Preview" className="w-64 h-64 object-cover rounded-lg" />
          <textarea
            placeholder="Describe the illness or what’s visible in the image..."
            className="w-full border rounded-lg p-4"
            value={userDescription}
            onChange={(e) => setUserDescription(e.target.value)}
          ></textarea>
          <button
            onClick={analyzeImageWithAI}
            disabled={isAnalyzing}
            className="px-6 py-3 bg-green-600 text-white rounded-lg"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze' }
          </button>
        </div>
      )}

      {analysisResult && (
        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-2">Diagnosis: {analysisResult.condition}</h3>
          <p className="mb-2">Confidence: {analysisResult.confidence}%</p>
          <p className="mb-4">{analysisResult.description}</p>

          <h4 className="text-xl font-medium mb-2">Recommended Doctors</h4>
          <ul className="list-disc list-inside">
            {recommendedDoctors.map((doc, i) => <li key={i}>{doc.name} ({doc.specialty})</li>)}
          </ul>

          <button
            onClick={() => setShowChat(true)}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg"
          >
            Chat with AI
          </button>
        </div>
      )}

      {showChat && (
        <div className="mt-8 bg-gray-100 p-4 rounded-lg">
          <div className="max-h-96 overflow-y-auto space-y-3 mb-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`p-3 rounded ${msg.type === 'ai' ? 'bg-white' : 'bg-blue-200 text-right'}`}>
                <p>{msg.message}</p>
                <small className="text-gray-500 block mt-1">{msg.timestamp.toLocaleTimeString()}</small>
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>

          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 p-2 border rounded"
              placeholder="Ask a question..."
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded"
              disabled={isChatLoading}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MedicalAIAssistant;
