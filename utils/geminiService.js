import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || process.env.MOCK_AI === 'true') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// Helper to sanitize JSON response from Gemini
const cleanJSON = (text) => {
  let cleaned = text.trim();
  // Strip code blocks if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return JSON.parse(cleaned.trim());
};

// 1. EXTRACT STRUCTURED INFORMATION FROM RESUME TEXT
export const parseResumeText = async (text) => {
  const client = getGeminiClient();
  
  if (!client) {
    console.log('Gemini Service: Running in MOCK Mode for Parse Resume');
    return {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0199',
      education: [
        {
          institution: 'State University',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          startDate: '2020',
          endDate: '2024',
        },
      ],
      skills: ['JavaScript', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'Python', 'HTML5', 'CSS3', 'Git'],
      experience: [
        {
          company: 'Tech Solutions Inc',
          position: 'Frontend Intern',
          startDate: 'Jun 2023',
          endDate: 'Dec 2023',
          description: 'Developed responsive UI modules using React.js and Tailwind CSS. Collaborated with senior engineers to optimize website performance by 25%. Integrated backend REST APIs.',
        },
      ],
      projects: [
        {
          title: 'E-commerce Platform',
          description: 'A full-stack e-commerce web application featuring user authentication, product catalog, shopping cart, and Stripe payment gateway.',
          technologies: ['React.js', 'Node.js', 'MongoDB', 'Tailwind CSS'],
        },
      ],
      certifications: ['AWS Certified Cloud Practitioner', 'React Developer Certification'],
      languages: ['English (Fluent)', 'Spanish (Basic)'],
    };
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an expert AI resume parser. Analyze the following resume raw text and extract structured information.
      Return the output strictly in the following JSON format. Ensure all keys exist:
      {
        "name": "Full Name",
        "email": "Email Address",
        "phone": "Phone Number",
        "education": [
          {
            "institution": "University/School Name",
            "degree": "Degree",
            "fieldOfStudy": "Major/Field",
            "startDate": "Start Date",
            "endDate": "End Date/Present"
          }
        ],
        "skills": ["Skill 1", "Skill 2"],
        "experience": [
          {
            "company": "Company Name",
            "position": "Job Title",
            "startDate": "Start Date",
            "endDate": "End Date",
            "description": "Responsibilities and achievements"
          }
        ],
        "projects": [
          {
            "title": "Project Title",
            "description": "Short description",
            "technologies": ["Tech 1", "Tech 2"]
          }
        ],
        "certifications": ["Cert 1"],
        "languages": ["Lang 1"]
      }

      Resume Text:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return cleanJSON(responseText);
  } catch (error) {
    console.error('Error during AI Parsing:', error);
    throw new Error('Gemini failed to extract resume info.');
  }
};

// 2. ANALYZE RESUME QUALITY
export const analyzeResume = async (info) => {
  const client = getGeminiClient();

  if (!client) {
    console.log('Gemini Service: Running in MOCK Mode for Analyze Resume');
    return {
      summary: 'Strong foundational background in web development using JavaScript stacks, with practical project experience but lacking deployment or CI/CD specifications.',
      strengths: [
        'Solid React.js and Node.js backend integration foundations.',
        'High readability with clean project breakdowns.',
        'Core certifications completed (AWS, React).'
      ],
      weaknesses: [
        'Lack of metrics-based achievements (e.g. percentages or figures).',
        'No mention of automated unit testing (Jest, Cypress, etc.).',
        'Missing modern cloud deployments detail for self-projects.'
      ],
      missingSkills: ['Jest', 'TypeScript', 'Docker', 'CI/CD (GitHub Actions)', 'Redux Toolkit'],
      grammarSuggestions: [
        'In experience: Change "Collaborated with senior engineers to optimize..." to "Collaborated with senior engineering team to design and optimize..." for a more proactive tone.',
      ],
      formattingSuggestions: [
        'Include a dedicated portfolio link (GitHub, LinkedIn) in the contact header.',
        'Group skills by category (e.g., Frontend, Backend, Devops) instead of listing them as a single wall of text.'
      ],
      industryRecommendations: [
        'Focus on Javascript-heavy roles (Frontend Developer, React Engineer, Associate Software Engineer).',
        'Incorporate cloud practitioner keywords prominently in application applications.'
      ],
      keywordSuggestions: ['Docker', 'TypeScript', 'Jest', 'RESTful API', 'Agile Methodologies', 'Single Page Application'],
      actionableTips: [
        'Add live URLs or GitHub repository links to your E-commerce and other listed projects.',
        'Quantify results: include sizes of databases managed or response time enhancements in project bullets.'
      ],
    };
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an expert technical recruiter and resume auditor. Analyze the following extracted resume data:
      ${JSON.stringify(info, null, 2)}

      Provide a comprehensive critique. Output strictly as a JSON object matching this schema:
      {
        "summary": "Overall resume assessment",
        "strengths": ["Strength 1", "Strength 2"],
        "weaknesses": ["Weakness 1", "Weakness 2"],
        "missingSkills": ["Suggested skill 1"],
        "grammarSuggestions": ["Grammar correction 1"],
        "formattingSuggestions": ["Formatting recommendation 1"],
        "industryRecommendations": ["Recommended role / career direction"],
        "keywordSuggestions": ["ATS friendly keywords to add"],
        "actionableTips": ["Tip 1", "Tip 2"]
      }
    `;

    const result = await model.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (error) {
    console.error('Error during AI Analysis:', error);
    throw new Error('Gemini failed to analyze the resume.');
  }
};

// 3. GENERATE ATS SCORE REPORT
export const generateATSReport = async (info, targetRole) => {
  const client = getGeminiClient();

  if (!client) {
    console.log('Gemini Service: Running in MOCK Mode for ATS Report');
    const scoreOffset = targetRole.toLowerCase().includes('data') ? -8 : 4;
    return {
      overallScore: 78 + scoreOffset,
      keywordScore: 72,
      formattingScore: 85,
      experienceScore: 75,
      educationScore: 90,
      skillsScore: 70,
      missingKeywords: ['TypeScript', 'GraphQL', 'TailwindCSS', 'Webpack', 'CI/CD Pipelines'],
      checklist: [
        { task: 'Add email validation checks in project details', completed: false },
        { task: 'Incorporate target role title in header', completed: false },
        { task: 'Structure work experience with bullet points beginning with action verbs', completed: true },
        { task: 'List technical certifications prominently', completed: true },
        { task: 'Replace paragraphs with concise, single-line highlights', completed: false }
      ],
    };
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an ATS (Applicant Tracking System) simulator. Analyze the following resume data against the target role: "${targetRole}".
      Resume Data:
      ${JSON.stringify(info, null, 2)}

      Calculate numeric scores (0 to 100) and provide details. Output strictly as a JSON object matching this schema:
      {
        "overallScore": 85,
        "keywordScore": 75,
        "formattingScore": 90,
        "experienceScore": 80,
        "educationScore": 95,
        "skillsScore": 70,
        "missingKeywords": ["keyword1", "keyword2"],
        "checklist": [
          { "task": "Task description 1", "completed": false },
          { "task": "Task description 2", "completed": true }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (error) {
    console.error('Error during ATS calculation:', error);
    throw new Error('Gemini failed to generate ATS report.');
  }
};

// 4. ANALYZE SKILL GAP & LEARNING ROADMAP
export const analyzeSkillGap = async (userSkills, targetRole) => {
  const client = getGeminiClient();

  if (!client) {
    console.log('Gemini Service: Running in MOCK Mode for Skill Gap');
    return {
      matchingSkills: ['JavaScript', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'HTML5', 'CSS3', 'Git'],
      missingSkills: ['TypeScript', 'Redux Toolkit', 'Jest/Testing Library', 'Docker', 'AWS Deployment', 'GraphQL'],
      learningRoadmap: [
        {
          phase: 'Phase 1: Advanced Frontend & State Management',
          topic: 'TypeScript, Redux Toolkit, and Performance Optimization',
          resources: ['TypeScript Deep Dive guide', 'Official Redux Toolkit Tutorial', 'Frontend Masters Advanced React'],
          duration: '3 weeks'
        },
        {
          phase: 'Phase 2: Testing & DevOps Foundations',
          topic: 'Testing with Jest, Cypress, and Containerization using Docker',
          resources: ['Traversy Media Jest Crash Course', 'Docker Mastery on Udemy', 'GitHub Actions workflow guides'],
          duration: '3 weeks'
        },
        {
          phase: 'Phase 3: Cloud & GraphQL',
          topic: 'AWS Amplify/EC2 deployments and GraphQL Client-Server integrations',
          resources: ['AWS Cloud Practitioner Essentials', 'Apollo GraphQL official tutorials'],
          duration: '2 weeks'
        }
      ],
      recommendedCertifications: [
        'AWS Certified Developer - Associate',
        'Meta Front-End Developer Professional Certificate'
      ],
      estimatedLearningTime: '8 weeks (12-15 hours/week)'
    };
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an industry career coach. Compare the candidate's skills with the requirements of a "${targetRole}".
      Candidate Skills: ${JSON.stringify(userSkills)}

      Provide a skill gap analysis, recommendations, and learning roadmap. Output strictly in the following JSON format:
      {
        "matchingSkills": ["skill1"],
        "missingSkills": ["skill2"],
        "learningRoadmap": [
          {
            "phase": "Phase title",
            "topic": "Topics covered",
            "resources": ["Resource name/url"],
            "duration": "Estimated duration (e.g. 2 weeks)"
          }
        ],
        "recommendedCertifications": ["Cert 1"],
        "estimatedLearningTime": "X weeks"
      }
    `;

    const result = await model.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (error) {
    console.error('Error during Skill Gap analysis:', error);
    throw new Error('Gemini failed to generate Skill Gap report.');
  }
};

// 5. GENERATE INTERVIEW QUESTIONS
export const generateInterviewQuestions = async (info, targetRole, experienceLevel) => {
  const client = getGeminiClient();

  if (!client) {
    console.log('Gemini Service: Running in MOCK Mode for Interview Prep');
    return [
      {
        question: 'Can you introduce yourself and walk me through the key projects on your resume?',
        type: 'HR',
        sampleAnswer: 'Certainly. I am a junior software engineer specialized in JavaScript stacks. I recently developed a full-stack e-commerce project leveraging React, Express, and MongoDB, implementing secure JWT authentication, and integrating Stripe payments. I also completed an internship at Tech Solutions where I optimized CSS modules to boost site loading speeds by 25%.',
        explanation: 'Focus on telling a story, starting from your education, summarizing technical strengths, and explaining how your projects solve specific commercial or user problems.'
      },
      {
        question: 'Explain the difference between Virtual DOM and Shadow DOM in frontend development.',
        type: 'Technical',
        sampleAnswer: 'The Virtual DOM is a lightweight in-memory representation of the real DOM used by libraries like React to optimize rendering performance by batching updates. The Shadow DOM is a web standard used for encapsulation, allowing developers to isolate DOM tree styles and scopes (such as in Web Components), preventing style leaking.',
        explanation: 'Showcase that you understand both React internals (Virtual DOM) and native web standards (Shadow DOM).'
      },
      {
        question: 'Write a function in JavaScript to check if a string is a palindrome, ignoring non-alphanumeric characters.',
        type: 'Coding',
        sampleAnswer: 'function isPalindrome(str) {\n  const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return cleanStr === cleanStr.split("").reverse().join("");\n}',
        explanation: 'Ensure you explain edge cases, regex replacement, and standard array reversal complexity (O(N) time and space).'
      },
      {
        question: 'Imagine our payment gateway fails during a checkout process. How would you design the system to handle this gracefully for the customer?',
        type: 'Scenario',
        sampleAnswer: 'I would implement a multi-tiered fallback. On the backend, we should use a message queue (like RabbitMQ) to retry payment logs, while immediately notifying the user of the transient error on the UI. We can prompt the customer to try an alternate payment method, retry after a few seconds, or save their current cart details safely for later, and send a transaction failure email update.',
        explanation: 'Recruiters want to see structural thinking: UI feedback, API status codes, data persistence, and transaction retry policies.'
      },
      {
        question: 'Tell me about a time you encountered a merge conflict or a disagreement with a team member. How did you resolve it?',
        type: 'Behavioral',
        sampleAnswer: 'During my internship, a teammate and I worked on overlapping components, which resulted in a massive merge conflict. Instead of force-pushing, we set up a 15-minute quick call to walk through the files together line-by-line, determining the best merge solution, which helped us avoid overriding each other\'s enhancements and taught us to coordinate branches better.',
        explanation: 'Use the STAR format: Situation, Task, Action, and Result. Highlight communication and collaboration over ego.'
      }
    ];
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are a technical interviewer. Generate 5 interview questions based on the candidate's details for a "${targetRole}" role at "${experienceLevel}" level.
      Candidate Info: ${JSON.stringify(info, null, 2)}

      Generate exactly one question of each type: 'HR', 'Technical', 'Coding', 'Scenario', 'Behavioral'.
      Provide a highly detailed sample answer and explanation for each.
      Output strictly as a JSON array matching this schema:
      [
        {
          "question": "Question text",
          "type": "HR" | "Technical" | "Coding" | "Scenario" | "Behavioral",
          "sampleAnswer": "Sample answer",
          "explanation": "Why this question is asked and how to answer"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (error) {
    console.error('Error generating interview questions:', error);
    throw new Error('Gemini failed to generate interview questions.');
  }
};

// 6. EVALUATE MOCK INTERVIEW RESPONSE (ONE QUESTION AT A TIME)
export const evaluateMockResponse = async (questionText, candidateAnswer, chatHistory = []) => {
  const client = getGeminiClient();

  if (!client) {
    console.log('Gemini Service: Running in MOCK Mode for Interview Chat Feedback');
    
    // Generate intelligent-looking dynamic mock feedback based on length/keywords
    const words = candidateAnswer.trim().split(/\s+/).length;
    let score = 50;
    let feedback = '';
    
    if (words < 5) {
      score = 45;
      feedback = 'The answer is too brief. Try to explain your reasoning and provide details, technologies, or examples to support your point.';
    } else if (candidateAnswer.toLowerCase().includes('react') || candidateAnswer.toLowerCase().includes('state') || candidateAnswer.toLowerCase().includes('dom')) {
      score = 85;
      feedback = 'Good detail. You successfully mentioned correct core concepts. Your technical terminology is highly relevant, but you can build on this by providing a short personal project example.';
    } else {
      score = 75;
      feedback = 'Clear response, but slightly generic. To improve, try linking your answer directly to practical engineering decisions, and focus on structuring with the STAR framework.';
    }

    const techScore = Math.round(score * 0.95);
    const commScore = Math.round(score * 1.02);
    const gramScore = 88;

    return {
      feedback,
      scores: {
        technical: Math.min(100, techScore),
        communication: Math.min(100, commScore),
        grammar: gramScore
      }
    };
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an AI Interviewer. Evaluate the candidate's response to the interview question below.
      
      Question: "${questionText}"
      Candidate Response: "${candidateAnswer}"
      
      Review the response's technical accuracy, grammar, and communication quality.
      Output strictly as a JSON object matching this schema:
      {
        "feedback": "Constructive feedback and tips for improvement",
        "scores": {
          "technical": 80,
          "communication": 85,
          "grammar": 90
        }
      }
    `;

    const result = await model.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (error) {
    console.error('Error during answer evaluation:', error);
    throw new Error('Gemini failed to evaluate candidate response.');
  }
};

// 7. COMPILE FINAL MOCK INTERVIEW REPORT
export const compileFinalInterviewReport = async (chatHistory) => {
  const client = getGeminiClient();

  if (!client) {
    console.log('Gemini Service: Running in MOCK Mode for Compilation');
    
    // Average scores in history
    let techSum = 0;
    let commSum = 0;
    let gramSum = 0;
    let count = 0;

    chatHistory.forEach(item => {
      if (item.scores) {
        techSum += item.scores.technical;
        commSum += item.scores.communication;
        gramSum += item.scores.grammar;
        count++;
      }
    });

    const scores = count > 0 ? {
      technical: Math.round(techSum / count),
      communication: Math.round(commSum / count),
      grammar: Math.round(gramSum / count),
      overall: Math.round((techSum + commSum + gramSum) / (3 * count))
    } : { technical: 75, communication: 80, grammar: 85, overall: 80 };

    return {
      scores,
      suggestions: [
        'Practice formatting technical explanations using the STAR technique (Situation, Task, Action, Result).',
        'Add details regarding scalability or performance optimization in technical design responses.',
        'Speak/type at a steadier pace, ensuring sentence transitions are clear and correct.'
      ],
      finalReport: 'Excellent technical understanding. The candidate has a solid grasp of web architecture and JavaScript standards. Minor enhancements can be made in structuring responses, especially for behavioral or situational questions.'
    };
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are the Head Interviewer. Analyze the following transcript of a mock interview:
      ${JSON.stringify(chatHistory, null, 2)}

      Summarize performance and compile scores. Output strictly in the following JSON format:
      {
        "scores": {
          "technical": 82,
          "communication": 85,
          "grammar": 90,
          "overall": 86
        },
        "suggestions": [
          "Actionable suggestion 1",
          "Actionable suggestion 2"
        ],
        "finalReport": "A cohesive written report summarizing strengths, weaknesses, and a final placement verdict."
      }
    `;

    const result = await model.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (error) {
    console.error('Error compiling final report:', error);
    throw new Error('Gemini failed to compile final interview report.');
  }
};

// 8. JOB DESCRIPTION MATCH ANALYSIS
export const analyzeJobMatch = async (resumeInfo, jdText) => {
  const client = getGeminiClient();

  if (!client) {
    console.log('Gemini Service: Running in MOCK Mode for Job Match');
    return {
      overallScore: 84,
      subScores: {
        skill: 80,
        keyword: 85,
        experience: 80,
        education: 95,
        ats: 82,
      },
      missingKeywords: ['TypeScript', 'GraphQL', 'Tailwind CSS', 'Redux Toolkit', 'Jest', 'CI/CD Pipelines'],
      missingSkills: ['TypeScript', 'Jest/Testing Library', 'State Management (Redux)', 'CI/CD Pipelines'],
      suggestions: [
        'Add a dedicated section for Web Developer tools and list Tailwind and Redux explicitly.',
        'Detail how you deployed your E-commerce platform (e.g. Vercel, Render) to improve cloud scores.',
      ],
      recommendedProjects: [
        {
          title: 'Secure Collaborative Workspace',
          description: 'Build a real-time collaborative note-taking application using React, TypeScript, socket.io, and Node/MongoDB. Implement detailed unit tests.',
          technologies: ['React', 'TypeScript', 'Socket.io', 'Jest'],
        },
      ],
      recommendedCertifications: [
        'AWS Certified Developer - Associate',
        'Certified Kubernetes Application Developer (CKAD)'
      ],
      tailoredSummary: 'Result-oriented Full Stack Developer with hands-on project experience in building responsive web interfaces (React, Node, Express, MongoDB). Demonstrates high aptitude for modern Javascript ecosystems, looking to leverage technical expertise in JavaScript stacks to contribute to scalable engineering solutions.',
    };
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an expert ATS matches analyzer. Compare the following Resume details with the Job Description text.
      
      Resume Details:
      ${JSON.stringify(resumeInfo, null, 2)}
      
      Job Description:
      ${jdText}
      
      Provide a comparative score (0-100) and analysis recommendations. Output strictly in the following JSON format:
      {
        "overallScore": 85,
        "subScores": {
          "skill": 80,
          "keyword": 85,
          "experience": 75,
          "education": 90,
          "ats": 80
        },
        "missingKeywords": ["keyword1"],
        "missingSkills": ["skill1"],
        "suggestions": ["suggestion1"],
        "recommendedProjects": [
          {
            "title": "Project Title",
            "description": "Short explanation",
            "technologies": ["tech1"]
          }
        ],
        "recommendedCertifications": ["Cert 1"],
        "tailoredSummary": "A highly customized professional summary matching this job description"
      }
    `;

    const result = await model.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (error) {
    console.error('Error during AI Job Match:', error);
    throw new Error('Gemini failed to analyze Job Description match.');
  }
};

// 9. PERSONALIZED STUDY ROADMAP GENERATOR
export const generatePersonalizedRoadmap = async (resumeInfo, missingSkills, targetRole) => {
  const client = getGeminiClient();

  if (!client) {
    console.log('Gemini Service: Running in MOCK Mode for Learning Roadmap');
    return {
      dailyTasks: [
        { id: 'd1', task: 'Review JavaScript Closures and ES6 modules syntax', hours: 2, difficulty: 'Medium', completed: false },
        { id: 'd2', task: 'Learn TypeScript basic types, interfaces, and configurations', hours: 3, difficulty: 'Easy', completed: false },
        { id: 'd3', task: 'Implement Redux Toolkit store in a basic React UI application', hours: 4, difficulty: 'Medium', completed: false },
        { id: 'd4', task: 'Write unit tests for Express API routers using Jest & Supertest', hours: 3, difficulty: 'Hard', completed: false },
        { id: 'd5', task: 'Configure simple CI/CD workflow with GitHub Actions', hours: 2, difficulty: 'Medium', completed: false },
      ],
      weeklyTasks: [
        { id: 'w1', week: 1, topics: ['TypeScript Integration', 'Type Definitions'], milestone: 'Convert React app to clean TypeScript', completed: false },
        { id: 'w2', week: 2, topics: ['State Management', 'Redux Toolkit'], milestone: 'Integrate global store with async API logic', completed: false },
        { id: 'w3', week: 3, topics: ['Testing frameworks', 'Jest', 'Cypress'], milestone: 'Attain 80% test coverage on backend routes', completed: false },
        { id: 'w4', week: 4, topics: ['Docker Containers', 'CI/CD YAML syntax'], milestone: 'Containerize and auto-deploy to cloud environment', completed: false },
      ],
    };
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an elite career development advisor. Based on the target role "${targetRole}",
      the candidate's resume: ${JSON.stringify(resumeInfo)}, and their missing skills: ${JSON.stringify(missingSkills)},
      generate a personalized study roadmap.
      
      Output exactly 5 daily tasks and 4 weekly modules. Output strictly in this JSON format:
      {
        "dailyTasks": [
          { "id": "d1", "task": "Task explanation", "hours": 2, "difficulty": "Easy" | "Medium" | "Hard" }
        ],
        "weeklyTasks": [
          { "id": "w1", "week": 1, "topics": ["Topic 1"], "milestone": "Target milestone reached" }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (error) {
    console.error('Error generating personalized roadmap:', error);
    throw new Error('Gemini failed to generate personalized study roadmap.');
  }
};

// 10. AI CAREER MENTOR CHATBOT Response (Streaming simulator)
export const chatWithCareerMentor = async (chatHistory, newMessage) => {
  const client = getGeminiClient();

  if (!client) {
    console.log('Gemini Service: Running in MOCK Mode for Mentor Chat');
    const msgLower = newMessage.toLowerCase();
    
    if (msgLower.includes('salary')) {
      return `### Salary Guidance for Software Engineers (2026)

Based on industry surveys, entry-level salaries for developer roles are highly dependent on location, skills, and target companies:
*   **Junior Developers (0-2 years):** Avg $65,000 - $90,500 / year (India: ₹4.5L - ₹9L LPA)
*   **Mid-Level Engineers (2-5 years):** Avg $95,000 - $130,000 / year (India: ₹10L - ₹22L LPA)
*   **Senior Developers (5+ years):** Avg $140,000 - $190,000+ / year (India: ₹25L - ₹45L+ LPA)

**Key Tips to Negotiate Higher Rates:**
1.  *Highlight Projects:* Demonstrate full-stack integrations or production deployments (AWS, Vercel).
2.  *Master Core Algorithms:* Practice data structures to secure tech-rounds clearing advantages.`;
    }

    if (msgLower.includes('certification') || msgLower.includes('certify')) {
      return `### Recommended Technical Certifications

For JavaScript and Cloud engineers, these certifications add massive weight to placement portfolios:
1.  **Cloud Architectures:** 
    *   *AWS Certified Cloud Practitioner* (Entry level foundation)
    *   *AWS Certified Developer - Associate* (Highly requested for backend engineers)
2.  **Frontend Stacks:**
    *   *Meta Front-End Developer Professional Certificate* (Coursera validation)
3.  **DevOps & Security:**
    *   *Docker Certified Associate*
    *   *Certified Kubernetes Application Developer (CKAD)*

*Certifications demonstrate commitment, but coupling them with high-impact Git repositories is key to clearance.*`;
    }

    return `Hello! I am your AI Career Mentor. I can assist you with technology recommendations, placements preparation advice, salary guidelines, certification suggestions, or portfolio reviews. 

Here are some suggested topics we can discuss:
*   *What are the must-have items for a placement portfolio?*
*   *Which cloud certification is best for backend developers?*
*   *Can you give me salary guidelines for React developers?*
*   *How do I answer "Tell me about yourself" in interviews?*

What career target can I guide you with today?`;
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Map messages array to Gemini Content structure
    const contents = chatHistory.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));
    
    contents.push({
      role: 'user',
      parts: [{ text: newMessage }]
    });

    const systemInstruction = "You are a professional career coach and placement mentor. Help students with resumes, career paths, salaries, certificates, and portfolio feedback. Use clean markdown styling and provide code snippets where appropriate.";

    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature: 0.7,
      }
    });

    return result.response.text();
  } catch (error) {
    console.error('Error during AI Mentor chat:', error);
    throw new Error('Gemini failed to answer mentor query.');
  }
};

// 11. EVALUATE UPGRADED MOCK INTERVIEW RESPONSE (ONE TURN WITH COMPANY DETAILS)
export const evaluateMockTurn = async (company, role, type, question, answer) => {
  const client = getGeminiClient();

  if (!client) {
    console.log('Gemini Service: Running in MOCK Mode for Mock Turn');
    const words = answer.trim().split(/\s+/).length;
    let score = 50;
    let feedback = '';

    if (words < 5) {
      score = 45;
      feedback = 'The answer is too brief for a corporate interview. Elaborate on details, technical frameworks, or situational results.';
    } else if (answer.toLowerCase().includes('agile') || answer.toLowerCase().includes('sql') || answer.toLowerCase().includes('design') || answer.toLowerCase().includes('code')) {
      score = 85;
      feedback = `Excellent detail. You successfully tailored your answer to ${company}'s standard. Technical keywords are highly relevant, but you can build on this by providing a short personal project example.`;
    } else {
      score = 75;
      feedback = `Clear response. To align closer with ${company}'s expectations for a ${role} role, try linking your answer directly to engineering decisions and structure with the STAR framework.`;
    }

    const offset = Math.round((Math.random() - 0.5) * 8);

    return {
      feedback,
      scores: {
        technical: Math.min(100, Math.max(0, score - 5 + offset)),
        communication: Math.min(100, Math.max(0, score + 2 + offset)),
        confidence: Math.min(100, Math.max(0, score + offset)),
        grammar: 88,
        fluency: Math.min(100, Math.max(0, score + 1 + offset)),
        problemSolving: Math.min(100, Math.max(0, score - 2 + offset))
      }
    };
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an expert AI Interviewer conducting a mock interview for the company "${company}" in the role "${role}" for type "${type}".
      
      Question Asked: "${question}"
      Candidate Response: "${answer}"
      
      Evaluate the response's technical accuracy, grammar, fluency, communication, and confidence.
      Output strictly in this JSON format:
      {
        "feedback": "Constructive feedback and tips for improvement",
        "scores": {
          "technical": 80,
          "communication": 85,
          "confidence": 75,
          "grammar": 90,
          "fluency": 80,
          "problemSolving": 85
        }
      }
    `;

    const result = await model.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (error) {
    console.error('Error during mock turn evaluation:', error);
    throw new Error('Gemini failed to evaluate candidate mock response.');
  }
};

// 12. COMPILE FINAL UPGRADED MOCK INTERVIEW REPORT
export const compileFinalMockReport = async (company, role, type, chatHistory) => {
  const client = getGeminiClient();

  if (!client) {
    console.log('Gemini Service: Running in MOCK Mode for Final Mock Report');
    
    // Average scores
    let techSum = 0, commSum = 0, confSum = 0, gramSum = 0, fluSum = 0, probSum = 0;
    let count = 0;

    chatHistory.forEach(item => {
      if (item.scores) {
        techSum += item.scores.technical;
        commSum += item.scores.communication;
        confSum += item.scores.confidence;
        gramSum += item.scores.grammar;
        fluSum += item.scores.fluency;
        probSum += item.scores.problemSolving;
        count++;
      }
    });

    const scores = count > 0 ? {
      technical: Math.round(techSum / count),
      communication: Math.round(commSum / count),
      confidence: Math.round(confSum / count),
      grammar: Math.round(gramSum / count),
      fluency: Math.round(fluSum / count),
      problemSolving: Math.round(probSum / count),
      overall: Math.round((techSum + commSum + confSum + gramSum + fluSum + probSum) / (6 * count))
    } : { overall: 78, technical: 75, communication: 80, confidence: 80, grammar: 85, fluency: 80, problemSolving: 75 };

    return {
      scores,
      areasForImprovement: [
        'Practice formatting technical explanations using the STAR technique (Situation, Task, Action, Result).',
        `Add details regarding scalability or performance optimization matching ${company} engineering standards.`,
        'Type at a steadier pace, ensuring sentence transitions are clear and correct.'
      ],
      recommendedResources: [
        `System Design Primer on Github`,
        `Crack the Coding Interview book tutorials`,
        `LeetCode medium string/array challenge sets`
      ],
      suggestedPracticeQuestions: [
        `Explain how you would design a scalable URL shortener for ${company}.`,
        `Tell me about a time you had to resolve a high priority bug under tight deadlines.`
      ]
    };
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are the Head Interviewer. Analyze the following mock interview transcript conducted for "${company}" in the role "${role}" (${type}):
      ${JSON.stringify(chatHistory, null, 2)}
      
      Compile aggregate scores (0-100), identify areas for improvement, list study resources, and suggest practice questions.
      Output strictly in this JSON format:
      {
        "scores": {
          "overall": 82,
          "technical": 80,
          "communication": 85,
          "confidence": 80,
          "grammar": 90,
          "fluency": 82,
          "problemSolving": 80
        },
        "areasForImprovement": ["Area 1"],
        "recommendedResources": ["Resource name/url"],
        "suggestedPracticeQuestions": ["Practice question 1"]
      }
    `;

    const result = await model.generateContent(prompt);
    return cleanJSON(result.response.text());
  } catch (error) {
    console.error('Error compiling final mock report:', error);
    throw new Error('Gemini failed to compile final mock report.');
  }
};
