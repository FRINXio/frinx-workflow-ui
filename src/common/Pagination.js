import React from 'react';
import { Pagination } from 'semantic-ui-react';

function PaginationPages(props) {
  return (
    <Pagination
      activePage={props.currentPage}
      onPageChange={(e, { activePage }) => props.changePageHandler(activePage)}
      totalPages={props.totalPages || 1}
    />
  );
}

export default PaginationPages;
