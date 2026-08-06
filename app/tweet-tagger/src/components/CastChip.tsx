import type { Cast } from "@iba-cast-gallery/dao";
import { Chip } from "@mui/material";

export type CastChipCast = Pick<Cast, "id" | "name">;

const CastChip: React.FC<{ cast: CastChipCast, dataTestId?:string}> = ({ cast, dataTestId }) => {
    return (
        <Chip label={cast.name} size="small" data-testid={dataTestId} />
    );
};

export default CastChip;
