import type { CastDto } from "@iba-cast-gallery/types";
import { Chip } from "@mui/material";

const CastChip: React.FC<{ cast: CastDto; dataTestId?: string }> = ({
  cast,
  dataTestId,
}) => {
  return <Chip label={cast.name} size="small" data-testid={dataTestId} />;
};

export default CastChip;
