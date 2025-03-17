import { Template } from "@/types/api"

export const MOCK_TEMPLATES: Template[] = [
  {
    id: "1",
    title: "Default SCR Extraction",
    description: "Standard template for extracting patient data from Summary Care Records. Optimized for accuracy and completeness.",
    model: "gpt-4-turbo-preview",
    instructions: "You are an AI assistant specialized in extracting patient data from NHS Summary Care Records. Your task is to accurately extract and structure patient information from Summary Care Records (SCRs) while maintaining strict medical data confidentiality.\n\nFocus on extracting:\n- Patient demographics\n- Current medications\n- Allergies and adverse reactions\n- Recent diagnoses\n- Vital medical history\n\nEnsure all extracted data maintains clinical accuracy and follows NHS data standards.",
    temperature: 0.7,
    isDefault: true,
    assistantType: "scr-extraction",
    assistantTypeId: "scr-extraction",
    createdAt: "2024-03-10T10:00:00Z",
    updatedAt: "2024-03-15T14:30:00Z",
  },
  {
    id: "2",
    title: "Fast Processing Mode",
    description: "Optimized for speed while maintaining good accuracy. Uses a more efficient model and higher temperature for faster processing.",
    model: "gpt-3.5-turbo",
    instructions: "Extract key patient information quickly, focusing on essential data points from NHS Summary Care Records. Prioritize speed while maintaining acceptable accuracy.\n\nKey extraction points:\n- Basic patient information\n- Current medications\n- Critical allergies\n- Major health conditions\n\nUse efficient processing to handle high volume of records while ensuring essential medical data is captured accurately.",
    temperature: 0.9,
    isDefault: false,
    assistantType: "scr-extraction",
    assistantTypeId: "scr-extraction",
    createdAt: "2024-03-12T15:20:00Z",
    updatedAt: "2024-03-14T09:45:00Z",
  },
] 