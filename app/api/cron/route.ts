import {bindings,scan,errorResponse} from '@/lib/later/server';
export async function POST(req:Request){const token=bindings().LATER_SCAN_TOKEN;if(!token||req.headers.get('Authorization')!==`Bearer ${token}`)return new Response('Unauthorized',{status:401});try{return Response.json(await scan());}catch(e){return errorResponse(e);}}
