import type { NextPage } from 'next';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Slider,
  TextField,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Container } from '@mui/system';
import { ChromePicker, type ColorResult } from 'react-color';
import download from 'downloadjs';

import { getFileUrl } from '../utils/getFileUrl';
import { convertSvgToImage } from '../utils/convertSvgToImage';
import { ResetDialog } from '../components/ResetDialog';

const Home: NextPage = () => {
  const [url, setUrl] = useState<string>('');
  const [expanded, setExpanded] = useState<string | false>('contentPanel');
  const [backgroundColor, setBackgroundColor] = useState('#fff');
  const [foregroundColor, setForegroundColor] = useState('#000');
  const [includeImage, setIncludeImage] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [imageDimension, setImageDimension] = useState(360);
  const [logoWidth, setLogoWidth] = useState(24);
  const [logoHeight, setLogoHeight] = useState(24);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  function handleChangeUrl(event: React.ChangeEvent<HTMLInputElement>) {
    setUrl(event.target.value);
  }

  const handleChange = (panel: string) => () => {
    setExpanded(panel);
  };

  function handleChangeBackgroundColor(color: ColorResult) {
    setBackgroundColor(color.hex);
  }

  function handleChangeForegroundColor(color: ColorResult) {
    setForegroundColor(color.hex);
  }

  function handleChangeImageDimension(_event: Event, value: number | number[]) {
    const newImageDimension = Array.isArray(value) ? value[0] : value;
    setImageDimension(newImageDimension);
  }

  function handleChangeIncludeImage(event: React.ChangeEvent<HTMLInputElement>) {
    setIncludeImage(event.target.checked);
  }

  function handleChangeImageWidth(event: React.ChangeEvent<HTMLInputElement>) {
    setLogoWidth(event.target.valueAsNumber);
  }

  function handleChangeImageHeight(event: React.ChangeEvent<HTMLInputElement>) {
    setLogoHeight(event.target.valueAsNumber);
  }

  async function downloadQRCode() {
    const qrCode = document.querySelector('#qrcode');
    if (!qrCode) {
      return;
    }

    const imageUrl = await convertSvgToImage(qrCode, { imageDimension });
    download(imageUrl, 'QRCode.png', 'image/png');
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.item(0);
    if (!file) {
      return;
    }

    const imageUrl = await getFileUrl(file);
    setImage(imageUrl);
  }

  function handleOpenResetDialog() {
    setIsResetDialogOpen(true);
  }

  function handleCloseResetDialog() {
    setIsResetDialogOpen(false);
  }

  function handleResetQRCode() {
    setUrl('');
    setBackgroundColor('#fff');
    setForegroundColor('#000');
    setIncludeImage(false);
    setImage(null);
    setLogoWidth(24);
    setLogoHeight(24);
  }

  return (
    <>
      <Head>
        <title>Gerador de QRCode</title>
      </Head>

      <Typography variant="h1" align="center" fontSize={36} fontWeight={700} mt={2}>
        Gerador de QRCode
      </Typography>

      <Container className="flex flex-col-reverse md:flex-row gap-8 flex-1 my-4">
        <div className="flex flex-col gap-4 flex-1">
          <Accordion expanded={expanded === 'contentPanel'} onChange={handleChange('contentPanel')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Conteúdo</Typography>
            </AccordionSummary>

            <AccordionDetails>
              <TextField
                variant="outlined"
                label="URL"
                placeholder="https://google.com"
                size="small"
                onChange={handleChangeUrl}
                fullWidth
              />
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === 'colorPanel'} onChange={handleChange('colorPanel')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Cor</Typography>
            </AccordionSummary>

            <AccordionDetails className="flex flex-wrap gap-4">
              <div className="flex flex-col flex-1 gap-4">
                <Typography>Cor de fundo</Typography>
                <ChromePicker
                  disableAlpha
                  color={backgroundColor}
                  onChange={handleChangeBackgroundColor}
                  className="select-none"
                  styles={{ default: { picker: { width: '100%' } } }}
                />
              </div>

              <div className="flex flex-col flex-1 gap-4">
                <Typography>Cor da frente</Typography>
                <ChromePicker
                  disableAlpha
                  color={foregroundColor}
                  onChange={handleChangeForegroundColor}
                  className="select-none"
                  styles={{ default: { picker: { width: '100%' } } }}
                />
              </div>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === 'logoPanel'} onChange={handleChange('logoPanel')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Logo</Typography>
            </AccordionSummary>

            <AccordionDetails>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox checked={includeImage} onChange={handleChangeIncludeImage} />}
                  label="Incluir imagem"
                />
              </FormGroup>

              <div className="flex flex-col gap-4">
                <Button variant="contained" component="label" disabled={!includeImage}>
                  Carregar imagem
                  <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
                </Button>

                <TextField
                  variant="outlined"
                  label="Largura"
                  placeholder="https://google.com"
                  size="small"
                  value={logoWidth}
                  onChange={handleChangeImageWidth}
                  InputProps={{ type: 'number' }}
                  disabled={!includeImage}
                  fullWidth
                />

                <TextField
                  variant="outlined"
                  label="Altura"
                  placeholder="https://google.com"
                  size="small"
                  value={logoHeight}
                  onChange={handleChangeImageHeight}
                  InputProps={{ type: 'number' }}
                  disabled={!includeImage}
                  fullWidth
                />
              </div>
            </AccordionDetails>
          </Accordion>
        </div>

        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-4 max-w-[256px]">
            <QRCodeSVG
              value={url}
              size={256}
              bgColor={backgroundColor}
              fgColor={foregroundColor}
              level="L"
              id="qrcode"
              imageSettings={
                includeImage && image
                  ? {
                      src: image,
                      x: undefined,
                      y: undefined,
                      width: logoWidth,
                      height: logoHeight,
                      excavate: true,
                    }
                  : undefined
              }
            />

            <div className="flex flex-col gap-2 w-full">
              <Typography>
                Dimensão: {imageDimension}px x {imageDimension}px
              </Typography>
              <Slider size="small" value={imageDimension} min={360} max={1000} onChange={handleChangeImageDimension} />

              <div className="flex gap-2">
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  className="rounded-lg"
                  fullWidth
                  onClick={handleOpenResetDialog}
                >
                  Resetar
                </Button>

                <Button variant="contained" size="large" className="rounded-lg" fullWidth onClick={downloadQRCode}>
                  Baixar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <ResetDialog open={isResetDialogOpen} onClose={handleCloseResetDialog} onConfirm={handleResetQRCode} />
    </>
  );
};

export default Home;
