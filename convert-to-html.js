const fs = require('fs');
const path = require('path');
const md = require('markdown-it')();

// Lê o arquivo markdown
const markdownFile = path.join(__dirname, 'USO_DO_APP.md');
const markdown = fs.readFileSync(markdownFile, 'utf-8');

// Converte para HTML
const html = md.render(markdown);

// Template HTML com styling profissional
const template = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guia de Uso - GeoTransportes </title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            color: #6b46c1;
            margin: 30px 0 20px 0;
            border-bottom: 3px solid #6b46c1;
            padding-bottom: 10px;
            font-size: 2.5em;
        }
        
        h2 {
            color: #8b5cf6;
            margin: 25px 0 15px 0;
            font-size: 1.8em;
        }
        
        h3 {
            color: #a78bfa;
            margin: 20px 0 10px 0;
            font-size: 1.4em;
        }
        
        p {
            margin: 12px 0;
            color: #555;
        }
        
        li {
            margin: 8px 0;
            color: #555;
        }
        
        ul, ol {
            margin: 20px 0 20px 20px;
        }
        
        img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            border: 1px solid #e0e0e0;
        }
        
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            color: #e83e8c;
        }
        
        blockquote {
            border-left: 4px solid #6b46c1;
            padding: 15px 20px;
            margin: 20px 0;
            background: #f8f9ff;
            border-radius: 4px;
        }
        
        /* Evitar quebras de página no meio de seções */
        h2 + ol, h2 + ul,
        h3 + ol, h3 + ul {
            page-break-inside: avoid;
        }
        
        li {
            page-break-inside: avoid;
        }
        
        img {
            page-break-inside: avoid;
        }
        
        /* Manter fluxos juntos */
        section, article {
            page-break-inside: avoid;
        }
        
        hr {
            border: none;
            border-top: 2px solid #e0e0e0;
            margin: 30px 0;
        }
        
        strong {
            color: #6b46c1;
            font-weight: 600;
        }
        
        footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            text-align: center;
            color: #999;
            font-size: 0.9em;
        }
        
        @media print {
            body {
                padding: 0;
                background: white;
            }
            .container {
                box-shadow: none;
                padding: 0;
            }
            img {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        ${html}
        <footer>
            <p>Guia de Uso - GeoTransportes PRO | Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
        </footer>
    </div>
</body>
</html>
`;

// Escreve o arquivo HTML
const outputFile = path.join(__dirname, 'docs', 'USO_DO_APP.html');
fs.writeFileSync(outputFile, template, 'utf-8');

console.log('✅ HTML gerado com sucesso em:', outputFile);
