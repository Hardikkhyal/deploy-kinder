const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

const doc = new Document({
    creator: "DevOpsHub",
    title: "DevOpsHub Summer Training Report",
    styles: {
        paragraphStyles: [
            {
                id: "Normal",
                name: "Normal",
                basedOn: "Normal",
                next: "Normal",
                run: { font: "Times New Roman", size: 24 }, // 12pt = 24 half-points
                paragraph: { spacing: { line: 360 }, alignment: AlignmentType.JUSTIFIED }
            },
            {
                id: "Heading1",
                name: "Heading 1",
                basedOn: "Normal",
                next: "Normal",
                run: { font: "Times New Roman", size: 28, bold: true }, // 14pt = 28 half-points
                paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.LEFT }
            },
            {
                id: "Heading2",
                name: "Heading 2",
                basedOn: "Normal",
                next: "Normal",
                run: { font: "Times New Roman", size: 24, bold: true }, // 12pt = 24 half-points
                paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.LEFT }
            }
        ]
    },
    sections: [
        {
            properties: {},
            children: [
                new Paragraph({ text: "AMRITSAR GROUP OF COLLEGES", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
                new Paragraph({ text: "", spacing: { after: 200 } }),
                new Paragraph({ text: "Summer Training Report", alignment: AlignmentType.CENTER }),
                new Paragraph({ text: "On", alignment: AlignmentType.CENTER }),
                new Paragraph({ text: "DEVOPSHUB - SELF HOSTED PAAS", heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }),
                new Paragraph({ text: "", spacing: { after: 400 } }),
                new Paragraph({ text: "Submitted in partial fulfillment of the requirement for the award of degree of Bachelor of Technology in COMPUTER SCIENCE & ENGINEERING", alignment: AlignmentType.CENTER }),
                new Paragraph({ text: "Batch (2024-2028)", alignment: AlignmentType.CENTER }),
                new Paragraph({ text: "", spacing: { after: 800 } }),
                new Paragraph({ text: "Submitted to: Department of CSE", alignment: AlignmentType.LEFT }),
                new Paragraph({ text: "Submitted by: Your Name (Roll No)", alignment: AlignmentType.LEFT })
            ]
        },
        {
            properties: {},
            children: [
                new Paragraph({ text: "1. Training Objective", heading: HeadingLevel.HEADING_1 }),
                new Paragraph({ text: "The primary objective of this summer training was to gain hands-on industry experience in Full-Stack Web Development, Cloud Computing, and DevOps practices. The training aimed at designing and developing a fully functional, self-hosted Platform-as-a-Service (PaaS) named 'DevOpsHub'. This platform automates cloud deployments using AWS EC2, Docker, and Nginx while implementing real-time communication protocols using WebSockets to stream live terminal logs to a web interface." }),
                
                new Paragraph({ text: "2. Organization Brief", heading: HeadingLevel.HEADING_1 }),
                new Paragraph({ text: "This project was conducted as part of the summer training curriculum. It focuses on bridging the gap between theoretical knowledge and practical software engineering challenges such as SSH orchestration, secure authentication, and database management." }),

                new Paragraph({ text: "3. Technology Used", heading: HeadingLevel.HEADING_1 }),
                new Paragraph({ text: "Frontend Technologies:", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "- React.js (v19): For building dynamic and responsive UI.\n- TypeScript: Ensures type safety and catching errors at compile-time.\n- Tailwind CSS: For rapid styling and layout.\n- Vite: Next-generation build tool.\n- Zustand: State management." }),
                new Paragraph({ text: "Backend Technologies:", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "- Node.js & Express.js: The core runtime handling APIs.\n- Socket.io: Real-time WebSocket log streaming.\n- SSH2: Establishing SSH connections to EC2 servers programmatically.\n- Prisma ORM & SQLite: For database management and safe queries." }),
                new Paragraph({ text: "Cloud & DevOps Infrastructure:", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "- AWS EC2: Cloud virtual machines hosting the applications.\n- Docker & Docker Compose: Containerization of user applications.\n- Git: Repository cloning." }),
                
                new Paragraph({ text: "4. Software Model", heading: HeadingLevel.HEADING_1 }),
                new Paragraph({ text: "The Agile Software Development Model was utilized for this project. It allowed continuous iteration and testing. Development was broken down into manageable sprints including requirement analysis, database design, backend API development, SSH integration, frontend integration, and Docker automation." }),

                new Paragraph({ text: "5. Project Details", heading: HeadingLevel.HEADING_1 }),
                new Paragraph({ text: "DevOpsHub is an automated platform that removes the need for manual server configuration. It performs a 9-stage deployment pipeline: Validation, SSH Authentication, Environment Checks, Workspace Preparation, Repository Cloning, Framework Detection, Docker Build, Docker Container Start, and Health Check. The user interface provides real-time logs, authentication via email OTPs, and encrypted storage for AWS credentials." }),
                
                new Paragraph({ text: "6. Project Screen Shots with Explanations", heading: HeadingLevel.HEADING_1 }),
                new Paragraph({ text: "(Please paste your screenshots here in MS Word. A 50-page report requires extensive screenshots of code snippets, UI dashboards, and AWS console configurations.)", alignment: AlignmentType.CENTER }),

                new Paragraph({ text: "7. Bibliography", heading: HeadingLevel.HEADING_1 }),
                new Paragraph({ text: "[1] A. S. Tanenbaum, Computer Networks, 5th ed., Pearson, 2011.\n[2] Docker Inc., 'Docker Documentation', Available: https://docs.docker.com/\n[3] Meta Platforms, 'React Documentation', Available: https://react.dev/" })
            ]
        }
    ]
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("d:\\project\\projectreport.docx", buffer);
    console.log("DOCX generated successfully!");
}).catch(console.error);
