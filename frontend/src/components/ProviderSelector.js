import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Tooltip,
  IconButton,
  Box 
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const ProviderSelector = ({ provider, onChange }) => {
  return (
    <Box display="flex" alignItems="center">
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="ai-provider-label">AI Sağlayıcı</InputLabel>
        <Select
          labelId="ai-provider-label"
          id="ai-provider-select"
          value={provider}
          label="AI Sağlayıcı"
          onChange={onChange}
        >
          <MenuItem value="openai">GPT-4o (OpenAI)</MenuItem>
        </Select>
        <FormHelperText>Analiz için AI sağlayıcısı seçin</FormHelperText>
      </FormControl>
      
      <Tooltip title="Analiz yapmak için OpenAI'nin GPT-4o modeli kullanılmaktadır. Bu model, daha güçlü ve çok yönlü bir analiz sağlar. Analiz yapmak için API anahtarınızın ayarlar kısmında yapılandırılmış olması gerekir." arrow>
        <IconButton size="small" sx={{ ml: 1 }}>
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ProviderSelector;