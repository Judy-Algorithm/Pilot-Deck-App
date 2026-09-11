import LaterApp from '@/components/later-app';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <LaterApp initialView="item" initialId={id}/>;}
