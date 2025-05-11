
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Cast, PostCastTag } from "@iba-cast-gallery/dao";
import { Button, Autocomplete, TextField, Stack } from "@mui/material";
import CastChip from "components/CastChip";
import TagSorter from "./TagSorter";

type TagEditorProps = {
  casts: Cast[];
  castTags: PostCastTag[];
  setCastTags: Dispatch<SetStateAction<PostCastTag[]>>
};

/**
 * ツイートのタグ情報を管理するコンポーネント
 * 
 * @param casts 選択肢となるキャスト情報
 * @param castTags 設定中のタグ情報
 * @param setCastTags タグ情報を設定する関数
 */
const TagEditor = ({ casts, castTags, setCastTags }: TagEditorProps) => {
  const [selectedCast, setSelectedCast] = useState<Cast | null>(null);

  const handleAddTag = () => {
    if (!selectedCast) return;

    setCastTags((prevTags) => {
      const newTags = [...prevTags, {
        castid: selectedCast.id,
        order: prevTags.length + 1,
        cast: selectedCast,
      } as PostCastTag];
      newTags.sort((a, b) => a.order - b.order);
      return newTags;
    });

    setSelectedCast(null);
  }

  return (
    <>
      <TagSorter castTags={castTags} setCastTags={setCastTags} />
      <Stack spacing={2} direction="row">
        <Autocomplete
          fullWidth
          options={casts.filter(cast => castTags.every(tag => tag.castid !== cast.id))}
          getOptionLabel={(option) => option.name}
          value={selectedCast}
          onChange={(event, newValue) => setSelectedCast(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="写ってるキャストを選択"
              variant="outlined"
            />
          )}
        />
        <Button onClick={handleAddTag}>追加</Button>
      </Stack>
    </>
  )
};

export default TagEditor;