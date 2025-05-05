import { Cast } from "@iba-cast-gallery/dao";
import { Chip } from "@mui/material";

const CastChip: React.FC<{ cast: Cast }> = ({ cast }) => {
    return (
        <Chip label={cast.name} size="small" />
    );
};

export default CastChip;
