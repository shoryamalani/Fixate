import { Table } from "@mui/material";
import { TableBody } from "@mui/material";
import { TableCell } from "@mui/material";
import { TableHead } from "@mui/material";
import { TableRow } from "@mui/material";
import { Paper } from "@mui/material";

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
  
  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }
  const headCells = [
    {
      id: 'name',
      numeric: false,
      disablePadding: true,
      label: 'Name',
    },
    {
      id: 'timeSpent',
      numeric: true,
      disablePadding: false,
      label: 'Time Spent',
    },
    {
      id: 'percentFocused',
      numeric: true,
      disablePadding: false,
      label: 'Percent Focused',
    },
    {
      id: 'distractionsPerHour',
      numeric: true,
      disablePadding: false,
      label: 'Distractions Per Hour',
    },
    {
      id: 'longestTimeFocused',
      numeric: true,
      disablePadding: false,
      label: 'Longest Time Focused',
    },
  ];
  
  // Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
  // stableSort() brings sort stability to non-modern browsers (notably IE11). If you
  // only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
  // with exampleArray.slice().sort(exampleComparator)
  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }
  
  function Leaderboard(props) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
      props;
    const createSortHandler = (property) => (event) => {
      onRequestSort(event, property);
    };
    return (
        <>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Application</TableCell>
                            <TableCell align="right">Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {headCells.map((headCell) => (
                                <TableCell 
                                key={headCell.id}
                                align={headCell.numeric ? 'right' : 'left'}
                                padding={headCell.disablePadding ? 'none' : 'normal'}
                                component="th" scope="row">
                                    {row.name}
                                </TableCell>
                                {/* <TableCell align="right">{row.status}</TableCell> */}
                                </TableRow>

                        ))}
                        </TableBody>
                </Table>
            </Paper>
        </>
    )
}
