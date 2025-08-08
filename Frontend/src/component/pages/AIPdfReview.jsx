import React, { useState, useRef } from 'react';
import { Upload, Send, FileText, Image, Loader2, AlertCircle, MessageCircle, Bot, User } from 'lucide-react';
import { GENERATIVE_AI_URL } from '../../utils/Data';
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const ReportReview = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  //const [apiKey, setApiKey] = useState('');
  const fileInputRef = useRef(null);

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (validTypes.includes(file.type)) {
        setUploadedFile(file);
        setError('');
      } else {
        setError('Please upload only JPEG, PNG, or PDF files');
      }
    }
  };

  const analyzeReport = async () => {
    if (!uploadedFile || !apiKey) {
      setError('Please upload a file and enter your Gemini API key');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const base64Data = await fileToBase64(uploadedFile);
      
      const requestBody = {
        contents: [{
          parts: [
            {
              text: `As a medical AI assistant for a hospital management system, please analyze this medical report thoroughly. Provide:

1. **Patient Information** (if visible): Name, age, gender, ID
2. **Report Type**: What kind of medical report this is
3. **Key Findings**: Important medical findings and values
4. **Abnormal Values**: Any values outside normal ranges with explanations
5. **Clinical Significance**: What these results might indicate
6. **Recommendations**: Suggested follow-up actions or consultations
7. **Summary**: Brief overview in simple terms

Please be thorough but clear, and note that this analysis is for informational purposes and should be reviewed by qualified medical professionals.`
            },
            {
              inline_data: {
                mime_type: uploadedFile.type,
                data: base64Data
              }
            }
          ]
        }]
      };

      const response = await fetch(GENERATIVE_AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.candidates[0].content.parts[0].text;

      const newMessage = {
        id: Date.now(),
        type: 'analysis',
        content: analysisText,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages([newMessage]);
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Parse structured analysis content
  const parseAnalysisContent = (content) => {
    const sections = {};
    const lines = content.split('\n');
    let currentSection = '';
    let currentContent = [];

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.match(/^\d+\.\s*(.*?):/)) {
        // Save previous section
        if (currentSection && currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        // Start new section
        currentSection = trimmedLine.replace(/^\d+\.\s*/, '').replace(':', '');
        currentContent = [];
      } else if (trimmedLine && currentSection) {
        currentContent.push(trimmedLine);
      }
    });

    // Save last section
    if (currentSection && currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    return sections;
  };

  // Typing indicator component
  const TypingIndicator = () => (
    <div className="flex items-center space-x-1 p-3">
      <Bot className="h-4 w-4 text-blue-500 animate-pulse" />
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-sm text-blue-500 animate-pulse">AI is analyzing...</span>
    </div>
  );

  // Render structured analysis
  const renderAnalysisSection = (title, content) => {
    const getSectionIcon = (title) => {
      if (title.toLowerCase().includes('patient')) return '👤';
      if (title.toLowerCase().includes('report type')) return '📋';
      if (title.toLowerCase().includes('finding')) return '🔍';
      if (title.toLowerCase().includes('abnormal')) return '⚠️';
      if (title.toLowerCase().includes('clinical')) return '🩺';
      if (title.toLowerCase().includes('recommendation')) return '💡';
      if (title.toLowerCase().includes('summary')) return '📝';
      return '•';
    };

    return (
      <div key={title} className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
          <span className="mr-2 text-lg">{getSectionIcon(title)}</span>
          {title}
        </h4>
        <div className="text-gray-700 leading-relaxed">
          {content.split('\n').map((line, idx) => (
            <div key={idx} className="mb-1">
              {line.startsWith('•') ? (
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  <span>{line.substring(1).trim()}</span>
                </div>
              ) : (
                <div>{line}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !apiKey) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage = {
      id: Date.now() + 0.5,
      type: 'typing',
      content: '',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const conversationContext = messages.map(msg => 
        `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n\n');

      const requestBody = {
        contents: [{
          parts: [{
            text: `Context: You are a medical AI assistant helping with a patient report analysis in a hospital management system. 

Previous conversation:
${conversationContext}

Current question: ${currentMessage}

Please provide a helpful, accurate response about the medical report or answer the medical question. Always remind that professional medical consultation is recommended for clinical decisions.`
          }]
        }]
      };

      const response = await fetch(GENERATIVE_AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.candidates[0].content.parts[0].text;

      // Remove typing indicator and add real response
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.type !== 'typing');
        return [...withoutTyping, {
          id: Date.now() + 1,
          type: 'ai',
          content: responseText,
          timestamp: new Date().toLocaleTimeString()
        }];
      });
    } catch (err) {
      setMessages(prev => prev.filter(msg => msg.type !== 'typing'));
      setError(`Failed to send message: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setUploadedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
  <div className="w-full    min-h-screen bg-gradient-to-br from-blue-100 to-white py-20 sm:px-10">
    <div className="max-w-7xl   mx-auto bg-white rounded-2xl shadow-2xl p-8 sm:p-10">

         <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-2 flex items-center">
          <FileText className="mr-3 text-blue-600 h-7 w-7" />
          Medical Report Analyzer
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Upload patient reports (images or PDFs) for AI-powered analysis
        </p>
         </div>
      {/* File Upload */}
      <div className="mb-8">
        <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-8 text-center transition hover:border-blue-400">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer block">
            <Upload className="mx-auto h-10 w-10 text-blue-500 mb-4" />
            <p className="text-base font-medium text-blue-700">Click to upload medical report</p>
            <p className="text-sm text-gray-500">Supports JPEG, PNG, and PDF files</p>
          </label>
        </div>

        {uploadedFile && (
          <div className="mt-5 p-4 bg-blue-50 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center">
              {uploadedFile.type.includes('image') ? (
                <Image className="h-6 w-6 text-blue-500 mr-3" />
              ) : (
                <FileText className="h-6 w-6 text-red-500 mr-3" />
              )}
              <div>
                <p className="font-medium text-blue-800">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              onClick={analyzeReport}
              disabled={isLoading || !apiKey}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Analyze Report
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Chat Messages */}
      {messages.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <MessageCircle className="mr-2" />
              Analysis & Chat
            </h3>
            <button
              onClick={clearChat}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Chat
            </button>
          </div>

          <div className=" rounded-xl p-4 max-h-96 overflow-y-auto">
            {messages.map((message) => {
              if (message.type === 'typing') {
                return (
                  <div key={message.id} className="mb-4 text-left">
                    <div className="inline-block bg-white p-2 rounded-lg border shadow-sm">
                      <TypingIndicator />
                    </div>
                  </div>
                );
              }

              if (message.type === 'analysis') {
                const sections = parseAnalysisContent(message.content);
                return (
                  <div key={message.id} className="mb-6">
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
                      <div className="flex items-center mb-4 pb-3 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">AI Medical Analysis</p>
                            <p className="text-xs text-gray-500">{message.timestamp}</p>
                          </div>
                        </div>
                        <div className="ml-auto">
                          <div className="flex items-center space-x-1 text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium">Analysis Complete</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {Object.entries(sections).map(([title, content]) => 
                          renderAnalysisSection(title, content)
                        )}
                        
                        {Object.keys(sections).length === 0 && (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                              {message.content.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div
                    className={`inline-block max-w-3xl p-4 rounded-xl shadow-sm ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-blue-500 bg-opacity-30' 
                          : 'bg-gradient-to-r from-green-400 to-blue-500'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')}
                        </div>
                        <p className={`text-xs mt-2 opacity-75`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat Input */}
      {messages.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask follow-up questions about the report..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={isLoading || !currentMessage.trim() || !apiKey}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center">
            <MessageCircle className="h-3 w-3 mr-1" />
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical diagnosis or treatment. Always consult qualified healthcare professionals for medical decisions.
        </p>
      </div>
    </div>
    </div>
  );





};

export default ReportReview;