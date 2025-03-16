import React from 'react';
import {Autocomplete, TextField} from '@mui/material';

type props = {
    casts: Cast[];
    selectedCast: Cast | null;
    setSelectedCast: (cast: Cast | null) => void;
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