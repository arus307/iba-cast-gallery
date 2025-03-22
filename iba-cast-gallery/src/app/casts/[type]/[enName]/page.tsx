"use client";
import { useData } from "context/DataContext";
import { notFound } from "next/navigation";

const CastPage = async ({ params }: { params: {type:CastType, enName:string}}) => {
    const db = useData();

    const {type, enName} = await params;

    const cast = db.casts.find((cast) => cast.type === type && cast.enName === enName);
    if(!cast){
        notFound();
    }

    return (
        <div>
            <h1>Cast Page</h1>
            <p>Type: {type}</p>
            <p>enName: {enName}</p>
        </div>
    );
};

export default CastPage;