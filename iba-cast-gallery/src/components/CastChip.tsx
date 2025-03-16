import { Chip } from "@mui/material";

const CastChip: React.FC<{cast:Cast}> = ({cast})=>{
    return (
        <Chip label={cast.name} size="small"/>
    );
};

export default CastChip;
