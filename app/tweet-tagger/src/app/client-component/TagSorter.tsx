import { Dispatch, SetStateAction } from "react";
import { PostCastTag } from "@iba-cast-gallery/dao";
import {Stack} from "@mui/material";
import CastChip from "components/CastChip";

type TagSorterProps = {
    castTags: PostCastTag[];
    setCastTags: Dispatch<SetStateAction<PostCastTag[]>>
};

const TagSorter = ({castTags, setCastTags}: TagSorterProps)=>{



  return (
    <div>
      タグ順序変更
      <Stack spacing={1} direction="row" sx={{ py: 1 }}>
        {castTags.map((tag) => (
          <CastChip
            key={tag.order}
            cast={tag.cast}
          />
        ))}
      </Stack>
    </div>
  );
};

export default TagSorter;
