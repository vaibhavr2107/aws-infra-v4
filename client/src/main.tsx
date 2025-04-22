import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "remixicon/fonts/remixicon.css";

// Include Inter font
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

// Custom CSS for step connector
const styleElement = document.createElement('style');
styleElement.textContent = `
  .step-connector {
    position: absolute;
    width: 2px;
    background-color: #EAECEF;
    top: 2rem;
    bottom: 0;
    left: 1.125rem;
    z-index: 0;
  }
  
  .step-connector-filled {
    position: absolute;
    width: 2px;
    background-color: #0066CC;
    top: 2rem;
    left: 1.125rem;
    z-index: 1;
    transition: height 0.5s ease-in-out;
  }
  
  :root {
    --aws-blue: #0066CC;
    --aws-orange: #FF9900;
    --aws-light-blue: #F0F7FF;
    --aws-light-orange: #FFF8E6;
    --success: #1E8E3E;
    --success-light: #E6F4EA;
    --warning: #F9A825;
    --warning-light: #FFF8E1;
    --error: #D93025;
    --error-light: #FDEEEE;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
document.head.appendChild(styleElement);

createRoot(document.getElementById("root")!).render(<App />);
