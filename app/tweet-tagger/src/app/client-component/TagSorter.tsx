"use client";

import { Dispatch, SetStateAction } from "react";
import { PostCastTag } from "@iba-cast-gallery/dao";
import { Stack, Chip } from "@mui/material";
import { DragEndEvent, DndContext, useSensors, PointerSensor, useSensor } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';

type TagSorterProps = {
  castTags: PostCastTag[];
  setCastTags: Dispatch<SetStateAction<PostCastTag[]>>
};

/**
 * 並べかえ可能なタグ
 * @params castTag 表示するタグ
 */
const SortableTag = ({ castTag, handleDelete }: { castTag: PostCastTag, handleDelete: () => void }) => {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: castTag.castid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
  };

  return (
    <Chip
      data-testid={`cast-tag-${castTag.order}`}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      onDelete={handleDelete}
      label={`${castTag.order} ${castTag.cast.name}`}
    />
  );
}

/**
 * タグの表示・並べ替えを行うコンポーネント
 * 
 * @params castTags タグ情報
 * @params setCastTags タグ情報を設定する関数
 */
const TagSorter = ({ castTags, setCastTags }: TagSorterProps) => {


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px以上動かないとドラッグが開始しない
      },
    })
  );

  // ドラッグ終了時に配列を更新する
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over === null) return;
    if (active.id !== over.id) {
      const oldIndex = castTags.findIndex(tag => tag.castid === active.id);
      const newIndex = castTags.findIndex(tag => tag.castid === over.id);

      // 新しい順序で配列を再構成
      const newTags = [...castTags];
      const [movedTag] = newTags.splice(oldIndex, 1);
      newTags.splice(newIndex, 0, movedTag);

      // orderを再設定
      newTags.forEach((tag, index) => {
        tag.order = index + 1;
      });

      setCastTags(newTags);
    }
  }

  return (
    <DndContext onDragEnd={onDragEnd} sensors={sensors}>
      <SortableContext items={castTags.map(tag => tag.castid)}>
        <Stack spacing={1} useFlexGap direction="row" sx={{ py: 1, flexWrap: "wrap" }} data-testid='tag-sorter'>
          {castTags.map((tag) => (
            <SortableTag
              key={tag.castid}
              castTag={tag}
              handleDelete={() => {
                // 削除されたタグ以外で再構成
                setCastTags(castTags.filter(t => t.castid !== tag.castid));
              }}
            />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
};

export default TagSorter;
