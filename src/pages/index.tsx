import type { NextPage } from 'next';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  ButtonGroup,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
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

type Level = 'L' | 'M' | 'Q' | 'H';

const Home: NextPage = () => {
  const [url, setUrl] = useState<string>('');
  const [expanded, setExpanded] = useState<string | false>('contentPanel');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [level, setLevel] = useState<Level>('L');
  const [includeLogo, setIncludeLogo] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string | null>('');
  const [logoWidth, setLogoWidth] = useState(24);
  const [logoHeight, setLogoHeight] = useState(24);
  const [imageDimension, setImageDimension] = useState(360);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const isResetButtonEnabled =
    url !== '' ||
    backgroundColor !== '#ffffff' ||
    foregroundColor !== '#000000' ||
    level !== 'L' ||
    includeLogo !== false ||
    logo !== null ||
    logoWidth !== 24 ||
    logoHeight !== 24;

  function handleChangeUrl(event: React.ChangeEvent<HTMLInputElement>) {
    setUrl(event.target.value);
  }

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  function handleChangeBackgroundColor(color: ColorResult) {
    setBackgroundColor(color.hex);
  }

  function handleChangeForegroundColor(color: ColorResult) {
    setForegroundColor(color.hex);
  }

  function handleChangeLevel(level: Level) {
    return function () {
      setLevel(level);
    };
  }

  function handleChangeImageDimension(_event: Event, value: number | number[]) {
    const newImageDimension = Array.isArray(value) ? value[0] : value;
    setImageDimension(newImageDimension);
  }

  function handleChangeIncludeLogo(event: React.ChangeEvent<HTMLInputElement>) {
    setIncludeLogo(event.target.checked);
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

    setLogoName(file.name);

    const imageUrl = await getFileUrl(file);
    setLogo(imageUrl);

    // @ts-ignore
    event.target.value = null;
  }

  function handleOpenResetDialog() {
    setIsResetDialogOpen(true);
  }

  function handleCloseResetDialog() {
    setIsResetDialogOpen(false);
  }

  function handleResetQRCode() {
    setUrl('');
    setBackgroundColor('#ffffff');
    setForegroundColor('#000000');
    setLevel('L');
    setIncludeLogo(false);
    setLogo(null);
    setLogoName('');
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
            <AccordionSummary
              expandIcon={
                <IconButton>
                  <ExpandMoreIcon />
                </IconButton>
              }
            >
              <Typography variant="button">Conteúdo</Typography>
            </AccordionSummary>

            <AccordionDetails>
              <TextField
                variant="outlined"
                label="URL"
                placeholder="https://google.com"
                size="small"
                value={url}
                onChange={handleChangeUrl}
                fullWidth
              />
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === 'colorPanel'} onChange={handleChange('colorPanel')}>
            <AccordionSummary
              expandIcon={
                <IconButton>
                  <ExpandMoreIcon />
                </IconButton>
              }
            >
              <Typography variant="button">Cor</Typography>
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
            <AccordionSummary
              expandIcon={
                <IconButton>
                  <ExpandMoreIcon />
                </IconButton>
              }
            >
              <Typography variant="button">Logo</Typography>
            </AccordionSummary>

            <AccordionDetails>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox checked={includeLogo} onChange={handleChangeIncludeLogo} />}
                  label="Incluir imagem"
                />
              </FormGroup>

              <div className="flex flex-col gap-4">
                <Button variant="contained" component="label" disabled={!includeLogo}>
                  Carregar imagem
                  <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
                </Button>

                {logoName && (
                  <Typography variant="body2" color="#666">
                    Nome: {logoName}
                  </Typography>
                )}

                <TextField
                  variant="outlined"
                  label="Largura"
                  placeholder="https://google.com"
                  size="small"
                  value={logoWidth}
                  onChange={handleChangeImageWidth}
                  InputProps={{ type: 'number' }}
                  disabled={!includeLogo}
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
                  disabled={!includeLogo}
                  fullWidth
                />
              </div>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === 'levelPanel'} onChange={handleChange('levelPanel')}>
            <AccordionSummary
              expandIcon={
                <IconButton>
                  <ExpandMoreIcon />
                </IconButton>
              }
            >
              <Typography variant="button">Nível</Typography>
            </AccordionSummary>

            <AccordionDetails>
              <ButtonGroup size="small" aria-label="small button group">
                <Button variant={level === 'L' ? 'contained' : 'outlined'} onClick={handleChangeLevel('L')}>
                  L
                </Button>
                <Button variant={level === 'M' ? 'contained' : 'outlined'} onClick={handleChangeLevel('M')}>
                  M
                </Button>
                <Button variant={level === 'Q' ? 'contained' : 'outlined'} onClick={handleChangeLevel('Q')}>
                  Q
                </Button>
                <Button variant={level === 'H' ? 'contained' : 'outlined'} onClick={handleChangeLevel('H')}>
                  H
                </Button>
              </ButtonGroup>
            </AccordionDetails>
          </Accordion>
        </div>

        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-4 max-w-[256px]">
            <QRCodeSVG
              id="qrcode"
              value={url}
              size={256}
              bgColor={backgroundColor}
              fgColor={foregroundColor}
              level={level}
              imageSettings={
                includeLogo && logo
                  ? {
                      src: logo,
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
              <Typography variant="caption" color="CaptionText">
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
                  disabled={!isResetButtonEnabled}
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
