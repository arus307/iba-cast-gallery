"use client";

import {
    Autocomplete,
    Chip,
    Stack,
    TextField,
    Typography,
    createFilterOptions,
} from "@mui/material";
import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CastType } from "@iba-cast-gallery/types";

export type CastOption = {
    id: number;
    name: string;
    type: CastType;
    isActive?: boolean;
};

type CastMultiSelectProps = {
    casts: CastOption[];
    value: number[];
    onChange: (castIds: number[]) => void;
    label: string;
    helperText?: string;
    ordered?: boolean;
    fixedIds?: number[];
    testId: string;
};

const katakanaToHiragana = (value: string) =>
    value
        .normalize("NFKC")
        .replace(/[\u30A1-\u30F6]/g, (character) =>
            String.fromCharCode(character.charCodeAt(0) - 0x60),
        );

const filterOptions = createFilterOptions<CastOption>({
    stringify: (cast) => `${cast.name} ${katakanaToHiragana(cast.name)}`,
});

const uniqueIds = (ids: number[]) => Array.from(new Set(ids));

function SortableCastChip({
    cast,
    index,
    onDelete,
    testId,
}: {
    cast: CastOption;
    index: number;
    onDelete: () => void;
    testId: string;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: cast.id });

    return (
        <Chip
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                touchAction: "none",
            }}
            label={`${index + 1} ${cast.name}`}
            onDelete={onDelete}
            data-testid={`${testId}-selected-${index + 1}`}
        />
    );
}

const CastMultiSelect = ({
    casts,
    value,
    onChange,
    label,
    helperText,
    ordered = false,
    fixedIds = [],
    testId,
}: CastMultiSelectProps) => {
    const selectedCasts = value
        .map((id) => casts.find((cast) => cast.id === id))
        .filter((cast): cast is CastOption => cast !== undefined);
    const fixedIdSet = new Set(fixedIds);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = value.indexOf(Number(active.id));
        const newIndex = value.indexOf(Number(over.id));
        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        const next = [...value];
        const [moved] = next.splice(oldIndex, 1);
        next.splice(newIndex, 0, moved);
        onChange(next);
    };

    return (
        <Stack spacing={1}>
            {ordered && selectedCasts.length > 0 && (
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <SortableContext items={selectedCasts.map((cast) => cast.id)}>
                        <Stack
                            direction="row"
                            useFlexGap
                            flexWrap="wrap"
                            gap={1}
                            data-testid={`${testId}-selected-list`}
                        >
                            {selectedCasts.map((cast, index) => (
                                <SortableCastChip
                                    key={cast.id}
                                    cast={cast}
                                    index={index}
                                    testId={testId}
                                    onDelete={() =>
                                        onChange(value.filter((id) => id !== cast.id))
                                    }
                                />
                            ))}
                        </Stack>
                    </SortableContext>
                </DndContext>
            )}

            <Autocomplete
                fullWidth
                multiple
                disableCloseOnSelect={!ordered}
                options={
                    ordered
                        ? casts.filter((cast) => !value.includes(cast.id))
                        : casts
                }
                value={ordered ? [] : selectedCasts}
                isOptionEqualToValue={(option, selected) =>
                    option.id === selected.id
                }
                getOptionLabel={(option) => option.name}
                groupBy={(option) =>
                    option.type === CastType.REAL
                        ? "リアルキャスト (RC)"
                        : "イマジナリーキャスト (IC)"
                }
                getOptionDisabled={(option) =>
                    option.isActive === false && !value.includes(option.id)
                }
                filterOptions={filterOptions}
                onChange={(_, newValue) => {
                    const nextIds = newValue.map((cast) => cast.id);
                    if (ordered) {
                        onChange(uniqueIds([...value, ...nextIds]));
                        return;
                    }
                    onChange(uniqueIds([...fixedIds, ...nextIds]));
                }}
                renderTags={(tagValue, getTagProps) =>
                    tagValue.map((cast, index) => {
                        const tagProps = getTagProps({ index });
                        const isFixed = fixedIdSet.has(cast.id);
                        return (
                            <Chip
                                {...tagProps}
                                key={cast.id}
                                label={
                                    isFixed
                                        ? `${cast.name}（写真タグ）`
                                        : cast.name
                                }
                                color={isFixed ? "secondary" : "default"}
                                onDelete={isFixed ? undefined : tagProps.onDelete}
                            />
                        );
                    })
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={label}
                        data-testid={testId}
                        slotProps={{
                            htmlInput: {
                                ...params.inputProps,
                                "data-testid": `${testId}-input`,
                            },
                        }}
                    />
                )}
                slotProps={{
                    listbox: {
                        id: `${testId}-listbox`,
                    },
                }}
            />

            {helperText && (
                <Typography variant="caption" color="text.secondary">
                    {helperText}
                </Typography>
            )}
        </Stack>
    );
};

export default CastMultiSelect;
