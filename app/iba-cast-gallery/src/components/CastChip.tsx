import { CastDto } from "@iba-cast-gallery/types";
import { Chip } from "@mui/material";

const CastChip: React.FC<{cast:CastDto}> = ({cast})=>{
    return (
        <Chip label={cast.name} size="small"/>
    );
};

export default CastChip;
