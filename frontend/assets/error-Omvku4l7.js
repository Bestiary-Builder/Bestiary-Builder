import{a as o}from"./index-Bd-vmtCs.js";o.config.errorHandler=(e,r,t)=>{fetch("https://discord.com/api/webhooks/1254166788384493721/dCpqJ4M9S-ofjGEe8bgDHYSmWdFsK22B7aMy3FOmzQeH6Wgm6gs6U-GKBjkfSmPX9Z1i",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({content:`Frontend error: 
${e.stack??e}`,username:"Bestiary Builder",avatar_url:"https://bestiarybuilder.com/logo.png"})}).catch(()=>{console.error("Failed to send error message.")})};