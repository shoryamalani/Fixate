// @flow
import React, { useState } from "react";
import styled from "@xstyled/styled-components";
import { colors } from "@atlaskit/theme";
import PropTypes from "prop-types";
import Column from "./Column";
import reorder, { reorderQuoteMap } from "../reorder";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";

const Container = styled.div`
  background-color: ${colors.B100};
  min-height: 100vh;
  /* like display:flex but will allow bleeding over the window width */
  // min-width: 100vw;
  display: inline-flex;
`;

const Board = ({
  isCombineEnabled,
  initial,
  useClone,
  containerHeight,
  withScrollableColumns,
  apps
}) => {
  const [columns, setColumns] = useState(initial);
  const currentWorkflow = useSelector(state => state.app.currentWorkflow);
  const allApps = useSelector(state => state.app.apps);
  console.log(initial)
  const [ordered, setOrdered] = useState(Object.keys(initial));
  const add_workflow_modification = async (workflow_id,modification) => {
    return await fetch('http://localhost:5005/add_workflow_modification',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "workflow_id": workflow_id,
        "modification": modification,
      })
    }).then(
      response => response.json()
    ).then( data => {
    }).catch(error => {
      alert("Error adding workflow modification")
    });
  }
  const onDragEnd = (result) => {
    console.log(result)
    if (result.combine) {
      if (result.type === "COLUMN") {
        const shallow = [...ordered];
        shallow.splice(result.source.index, 1);
        setOrdered(shallow);
        return;
      }
      

      const column = columns[result.source.droppableId];
      const withQuoteRemoved = [...column];

      withQuoteRemoved.splice(result.source.index, 1);
      console.log(withQuoteRemoved)
      const orderedColumns = {
        ...columns,
        [result.source.droppableId]: withQuoteRemoved
      };
      setColumns(orderedColumns);
      return;
    }

    // dropped nowhere
    if (!result.destination) {
      return;
    }

    const source = result.source;
    const destination = result.destination;

    // did not move anywhere - can bail early
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // reordering column
    if (result.type === "COLUMN") {
      const reorderedorder = reorder(ordered, source.index, destination.index);

      setOrdered(reorderedorder);

      return;
    }
    
    const data = reorderQuoteMap({
      quoteMap: columns,
      source,
      destination
    });
    console.log(allApps)
    add_workflow_modification(currentWorkflow,{
      "type":allApps[result.draggableId]['type'],
      "name":allApps[result.draggableId]['name'],
      "distracting":true ? result.destination.droppableId === 'Distracting' : false,
      "focused":true ? result.destination.droppableId === 'Focused' : false,
    })
    setColumns(data.quoteMap);
  };

  return (
    <>
    {/* <h1>Drag and Drop Status Board</h1> */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="board"
          type="COLUMN"
          direction="horizontal"
          ignoreContainerClipping={Boolean(containerHeight)}
          isCombineEnabled={isCombineEnabled}
          style={{ backgroundColor:'transparent' }}
        >
          {(provided) => (
            <Container ref={provided.innerRef} {...provided.droppableProps}>
              {ordered.map((key, index) => (
                <Column
                  key={key}
                  index={index}
                  title={key}
                  apps={columns[key]}
                  isScrollable={withScrollableColumns}
                  isCombineEnabled={isCombineEnabled}
                  useClone={useClone}
                />
              ))}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

Board.defaultProps = {
  isCombineEnabled: false
};

Board.propTypes = {
  isCombineEnabled: PropTypes.bool
};

export default Board;
