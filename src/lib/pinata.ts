import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT as string,
});

export async function uploadFileToIPFS(file: File): Promise<string> {
  const res = await pinata.upload.public.file(file);
  return res.cid;
}

export async function uploadJSONToIPFS(data: any): Promise<string> {
  const res = await pinata.upload.public.json(data);
  return res.cid;
} 