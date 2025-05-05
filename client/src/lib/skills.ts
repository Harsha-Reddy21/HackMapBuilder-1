export const skillCategories = [
  {
    name: "Programming Languages",
    skills: [
      "JavaScript",
      "TypeScript",
      "Python",
      "Java",
      "C#",
      "C++",
      "Rust",
      "Go",
      "Ruby",
      "PHP",
      "Swift",
      "Kotlin"
    ]
  },
  {
    name: "Frontend",
    skills: [
      "React",
      "Angular",
      "Vue",
      "Svelte",
      "HTML",
      "CSS",
      "Tailwind CSS",
      "Bootstrap",
      "Material UI",
      "Redux",
      "Next.js",
      "Gatsby"
    ]
  },
  {
    name: "Backend",
    skills: [
      "Node.js",
      "Express",
      "Django",
      "Flask",
      "FastAPI",
      "Spring Boot",
      "ASP.NET",
      "Laravel",
      "Ruby on Rails"
    ]
  },
  {
    name: "Database",
    skills: [
      "MySQL",
      "PostgreSQL",
      "MongoDB",
      "Firebase",
      "Redis",
      "SQLite",
      "Elasticsearch",
      "DynamoDB",
      "Supabase"
    ]
  },
  {
    name: "DevOps",
    skills: [
      "Docker",
      "Kubernetes",
      "AWS",
      "Azure",
      "GCP",
      "CI/CD",
      "GitHub Actions",
      "Jenkins",
      "Linux"
    ]
  },
  {
    name: "Mobile",
    skills: [
      "React Native",
      "Flutter",
      "iOS",
      "Android",
      "Xamarin",
      "Ionic",
      "Expo"
    ]
  },
  {
    name: "AI/ML",
    skills: [
      "TensorFlow",
      "PyTorch",
      "Scikit-Learn",
      "Computer Vision",
      "NLP",
      "Data Science",
      "Machine Learning"
    ]
  },
  {
    name: "Blockchain",
    skills: [
      "Ethereum",
      "Solidity",
      "Web3.js",
      "Smart Contracts",
      "NFT",
      "DeFi",
      "Blockchain Development"
    ]
  },
  {
    name: "Design",
    skills: [
      "UI Design",
      "UX Design",
      "Figma",
      "Adobe XD",
      "Sketch",
      "Photoshop",
      "Illustrator"
    ]
  },
  {
    name: "Other",
    skills: [
      "Project Management",
      "Technical Writing",
      "Data Analysis",
      "Business Analysis",
      "Game Development",
      "AR/VR",
      "IoT"
    ]
  }
];

export const allSkills = skillCategories.flatMap(category => category.skills);

export const getRelatedSkills = (userSkills: string[]): string[] => {
  // Create a set of categories that the user's skills belong to
  const userCategories = new Set<string>();
  
  skillCategories.forEach(category => {
    const hasSkillFromCategory = category.skills.some(skill => 
      userSkills.includes(skill)
    );
    if (hasSkillFromCategory) {
      userCategories.add(category.name);
    }
  });
  
  // Get all skills from those categories, excluding skills the user already has
  const relatedSkills = new Set<string>();
  
  userCategories.forEach(categoryName => {
    const category = skillCategories.find(c => c.name === categoryName);
    if (category) {
      category.skills.forEach(skill => {
        if (!userSkills.includes(skill)) {
          relatedSkills.add(skill);
        }
      });
    }
  });
  
  return Array.from(relatedSkills);
};
