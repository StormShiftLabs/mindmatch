import { useState, useRef, useCallback } from "react";

interface UseVoiceInputProps {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
}

/**
 * Custom hook for Web Speech API voice input
 */
export function useVoiceInput({ onResult, onError }: UseVoiceInputProps): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  // Check if Web Speech API is supported
  const isSupported = typeof window !== "undefined" && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      onError?.("Speech recognition is not supported in this browser");
      return;
    }

    try {
      // Create speech recognition instance
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);

        if (finalTranscript) {
          onResult(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        
        let errorMessage = "Speech recognition error occurred";
        switch (event.error) {
          case 'no-speech':
            errorMessage = "No speech was detected. Please try again.";
            break;
          case 'network':
            errorMessage = "Network error occurred. Please check your connection.";
            break;
          case 'not-allowed':
            errorMessage = "Microphone access denied. Please allow microphone permissions.";
            break;
          case 'service-not-allowed':
            errorMessage = "Speech recognition service is not allowed.";
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        onError?.(errorMessage);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      onError?.("Failed to start voice input");
      setIsListening(false);
    }
  }, [isSupported, onResult, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    transcript,
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
