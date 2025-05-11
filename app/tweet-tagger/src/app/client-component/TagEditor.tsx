
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Cast, PostCastTag } from "@iba-cast-gallery/dao";
import { Autocomplete, TextField } from "@mui/material";

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

  const [selectedCasts, setSelectedCasts] = useState<Cast[]>([]);

  useEffect(() => {
    const newCastTags: PostCastTag[] = selectedCasts.map((cast, index) => {
      return {
        castid: cast.id,
        order: index + 1,
        cast: cast,
      } as PostCastTag;
    });
    setCastTags(newCastTags);
  }, [selectedCasts])

  return (
    <div>
      タグ編集

      <Autocomplete
        multiple
        fullWidth
        options={casts}
        getOptionLabel={(option) => option.name}
        value={selectedCasts}
        onChange={(event, newValue) => setSelectedCasts(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="写ってるキャストを選択"
            variant="outlined"
          />
        )}
      />

    </div>
  )
};

export default TagEditor;