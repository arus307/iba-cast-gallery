import { Cast } from "@iba-cast-gallery/dao";
import { Chip } from "@mui/material";

const CastChip: React.FC<{ cast: Cast, dataTestId?:string}> = ({ cast, dataTestId }) => {
    return (
        <Chip label={cast.name} size="small" data-testid={dataTestId} />
    );
};

export default CastChip;
