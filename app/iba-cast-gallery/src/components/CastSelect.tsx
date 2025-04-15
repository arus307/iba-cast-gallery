import React from 'react';
import {Autocomplete, TextField} from '@mui/material';
import { CastDto } from '@iba-cast-gallery/types';

type props = {
    casts: CastDto[];
    selectedCast: CastDto | null;
    setSelectedCast: (cast: CastDto | null) => void;
}

const CastSelect: React.FC<props> = ({casts, selectedCast, setSelectedCast}) => {
    return (
        <Autocomplete
            fullWidth
            options={casts}
            getOptionLabel={(option) => option.name}
            value={selectedCast}
            onChange={(event, newValue) => setSelectedCast(newValue)}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="キャストで絞り込み"
                    variant="outlined"
                />
            )}
        />
    );
};

export default CastSelect;