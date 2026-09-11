import {mkdirSync,writeFileSync} from 'node:fs';
import {skills} from '../lib/later/skills';
for(const[name,body]of Object.entries(skills)){mkdirSync(`later-skills/${name}`,{recursive:true});writeFileSync(`later-skills/${name}/SKILL.md`,`---\nname: ${name}\ndescription: Later ${name} workflow.\n---\n\n${body}\n`);}
