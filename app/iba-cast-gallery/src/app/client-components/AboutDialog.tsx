"use client";
import {Dialog, DialogTitle, DialogContent, Typography, Link} from "@mui/material";

interface AboutDialogProps{
    open: boolean;
    setOpenDialog: (open: boolean) => void;
}

/**
 * "サイトについて"ダイアログ
 */
const AboutDialog = ({
    open,
    setOpenDialog
}:AboutDialogProps)=>{
    return (
        <Dialog open={open} onClose={()=>setOpenDialog(false)}>
            <DialogTitle>このサイトについて</DialogTitle>
            <DialogContent>
                <Typography sx={{mb:0.5}}>
                    このサイトは、IBA公式とは一切関係のないファンサイトです。
                </Typography>
                <Typography sx={{mb:0.5}}>
                    arus(<Link href="https://x.com/arus307" target='_blank' rel='noopener noreferrer'>@arus307</Link>)が勝手に開発しています。
                </Typography>
                <Typography>
                    タグ付けの誤りや反映されていないツイート、その他問題がありましたら<Link href="https://forms.gle/ATYKj4eXd3t8kJHB9" target='_blank' rel='noopener noreferrer'>お問い合わせフォーム</Link>もしくは上記のXアカウントまでご連絡ください。
                </Typography>
            </DialogContent>
        </Dialog>
    );
};

export default AboutDialog;
