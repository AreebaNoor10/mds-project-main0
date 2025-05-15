import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

export default function FinalReportTable() {
  // Get data from localStorage
  const finalReportData = JSON.parse(localStorage.getItem('finalReportData') || '{}');
  const reportItems = finalReportData.openai_final_report || [];

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Final Report Review</Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="final report table">
          <TableHead>
            <TableRow>
              <TableCell>Checkpoint</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Field</TableCell>
              <TableCell>MTR</TableCell>
              <TableCell>Unified</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.checkpoint}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.field}</TableCell>
                <TableCell>{item.MTR}</TableCell>
                <TableCell>{item.Unified}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 12px',
                      borderRadius: 2,
                      backgroundColor: item.Status === 'Pass' ? '#e6f4ea' : 
                                     item.Status === 'Review' ? '#fff4e5' : '#fce8e6',
                      color: item.Status === 'Pass' ? '#188038' : 
                            item.Status === 'Review' ? '#e58900' : '#d93025',
                      fontWeight: 500,
                      fontSize: 14,
                      border: item.Status === 'Pass' ? '1px solid #b7e1cd' : 
                              item.Status === 'Review' ? '1px solid #ffe0b2' : '1px solid #fad2cf',
                    }}
                  >
                    {item.Status}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 