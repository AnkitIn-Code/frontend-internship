import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AiResumeBuilder from './AiResumeBuilder';
const ResumeToolsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) navigate('/user-login');
  }, [navigate]);

  return (
    <div className="w-full h-full lg:h-screen lg:max-h-screen bg-background text-foreground flex flex-col overflow-hidden">

      {/* Main Resume Builder Container with generous space on top */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto px-3 sm:px-5 lg:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 flex flex-col min-h-0 h-full overflow-hidden">
        <AiResumeBuilder />
      </div>
    </div>
  );
};

export default ResumeToolsPage;

