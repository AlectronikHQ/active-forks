function showMsg( msg, type ) {
  let alertType = 'alert-info'

  if ( type === 'danger' )
    alertType = 'alert-danger'

  document.getElementById( 'footer' ).innerHTML = ''

  document.getElementById( 'data-body' ).innerHTML = `
        <div class="alert ${alertType} alert-dismissible fade show" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            ${msg}
        </div>
    `
}

function updateDT( data ) {
  // Remove any alerts
  if ( $( '.alert' ) )
    $( '.alert' ).remove()

  // Format dataset and redraw DataTable. Use second index for key name
  const forks = []
  for ( let fork of data ) {
    fork.ownerName = fork.owner.login
    fork.repoOwnerAndLink = `<a href="https://github.com/${fork.ownerName}">${fork.ownerName}</a>`
    fork.repoNameAndLink = `<a href="https://github.com/${fork.full_name}">${fork.name}</a>`
    forks.push( fork )
  }
  const dataSet = forks.map( fork => window.columnNamesMap.map( colNM => fork[colNM[1]] ) )
  window.forkTable.rows.add( dataSet ).draw()
}

function initDT() {
  // Create ordered Object with column name and mapped display name
  window.columnNamesMap = [
    // [ 'Repository', 'full_name' ],
    ['Owner', 'repoOwnerAndLink'],  // custom key
    ['Name', 'repoNameAndLink'],
    ['Branch', 'default_branch'],
    ['Stars', 'stargazers_count'],
    ['Forks', 'forks'],
    ['Size (kb)', 'size'],
    ['Commits<br>this Year', 'commitsCount'],
    ['Last Push', 'pushed_at'],
  ]

  // Sort by stars:
  const sortColName = 'Stars'
  const sortColumnIdx = window.columnNamesMap.map( pair => pair[0] ).indexOf( sortColName )

  // Use first index for readable column name
  window.forkTable = $( '#forkTable' ).DataTable( {
    columns: window.columnNamesMap.map( colNM => {
      return {'title': colNM[0]}
    } ),
    'order': [[sortColumnIdx, 'desc']],
  } )
}

// function timeSince( dateStr ) {
//   const date = new Date( dateStr )
//   const seconds = Math.floor( ( new Date() - date ) / 1000 )

//   let interval = Math.floor( seconds / 31536000 )

//   if ( interval > 1 )
//     return interval + ' years'

//   interval = Math.floor( seconds / 2592000 )
//   if ( interval > 1 )
//     return interval + ' months'

//   interval = Math.floor( seconds / 86400 )
//   if ( interval > 1 )
//     return interval + ' days'

//   interval = Math.floor( seconds / 3600 )
//   if ( interval > 1 )
//     return interval + ' hours'

//   interval = Math.floor( seconds / 60 )
//   if ( interval > 1 )
//     return interval + ' minutes'

//   return Math.floor( seconds ) + ' seconds'
// }

// function showData( data ) {
//   if ( !Array.isArray( data ) ) {
//     showMsg( 'GitHub repository does not exist', 'danger' )
//     return
//   }

//   if ( data.length === 0 ) {
//     showMsg( 'No forks exist!' )
//     return
//   }

//   const html = []
//   const thead = `
//         <thead>
//             <tr class="table-active">
//                 <th><i class="fa fa-github" aria-hidden="true"></i> Repository</th>
//                 <th><i class="fa fa-star" aria-hidden="true"></i> Stargazers</th>
//                 <th><i class="fa fa-code-fork" aria-hidden="true"></i> Forks</th>
//                 <th><i class="fa fa-clock-o" aria-hidden="true"></i> Last Push</th>
//             </tr>
//         </thead>
//     `

//   for ( const fork of data ) {
//     const item = `
//             <tr>
//                 <td><a href="${fork.html_url}">${fork.full_name}</a></td>
//                 <td>${fork.stargazers_count}</td>
//                 <td>${fork.forks_count}</td>
//                 <td>${timeSince( fork.pushed_at )} ago</td>
//             </tr>
//         `
//     html.push( item )
//   }

//   document.getElementById( 'data-body' ).innerHTML = `
//         <div class="table-responsive rounded">
//             <table class="table table-striped table-bordered table-hover">
//                 ${thead}
//                 <tbody>${html.join( '' )}</tbody>
//             </table>
//         </div>
//     `

//   document.getElementById( 'footer' ).innerHTML = `${data.length} ${data.length === 1 ? 'result' : 'results'}`
// }

function countCommits( headers, fork ) {
  fetch( `https://api.github.com/repos/${fork.full_name}/stats/commit_activity`, {
    headers: headers,
  } )
    .then( ( response ) =>  {
      if ( !response.ok )
        throw Error( response.statusText )
      return response.json()
    } )
    .then( ( stats ) => {
      fork.stats = stats
      if ( stats.length > 0 ) {
        fork.commitsCount = stats.reduce( ( week, accum ) => {
          return {total: accum.total + week.total}
        } ).total
      } else {
        fork.commitsCount = 'Err'
        console.log( `Failed to parse stats for fork with:
  https://api.github.com/repos/${fork.full_name}/stats/commit_activity` )
        console.log( fork )
      }
      updateDT( [fork] )
    } )
    .catch( ( error ) => {
      showMsg( `${error}. Additional info in console`, 'danger' )
      console.error( error )
    } )
}

function fetchAndShow( repo ) {
  // document.getElementById( 'find' ).disabled = true
  // document.getElementById( 'spinner' ).removeAttribute( 'hidden' )

  // Clear DataTable
  window.forkTable.clear().draw()

  // Get token and create headers
  var token = document.getElementById( 'token' ).value
  var headers = new Headers()
  if ( token.length > 10 )
    headers.append( 'Authorization', `token ${token}` )

  fetch( `https://api.github.com/repos/${repo}/forks?sort=stargazers`, {
    headers: headers,
  } )
    .then( ( response ) => {
      if ( !response.ok )
        throw Error( response.statusText )
      return response.json()
    } )
    .then( ( data ) => {
      // Creates Interactive DataTable
      if ( token.length > 10  ) {
        for ( let fork of data )
          countCommits( headers, fork )
      } else {
        // If not logged in, minimize number of API requests
        data.map( ( fork ) => {
          fork.stats = []
          fork.commitsCount = 'NA'
          return fork
        } )
        updateDT( data )
      }

      // // Previous Method Create Static HTML Table:
      // showData( data )
      // document.getElementById( 'find' ).disabled = false
      // document.getElementById( 'spinner' ).setAttribute( 'hidden', 'hidden' )
    } )
    .catch( ( error ) => {
      const msg = error.toString().indexOf( 'Forbidden' ) >= 0 ? 'Error: API Rate Limit Exceeded' : error
      showMsg( `${msg}. Additional info in console`, 'danger' )
      console.error( error )
    } )
}

function fetchData() {
  const repo = document.getElementById( 'q' ).value
  const re = /[-_\w]+\/[-_.\w]+/

  window.history.pushState( '', '', `?q=${repo}` )

  if ( re.test( repo ) )
    fetchAndShow( repo )
  else
    showMsg( 'Invalid GitHub repository! Format is &lt;username&gt;/&lt;repo&gt;', 'danger' )
}

document.getElementById( 'form' ).addEventListener( 'submit', ( e ) => {
  e.preventDefault()
  fetchData()
} )

function getQueryParams() {
  let query = location.search
  if ( !query )
    return { }

  return ( /^[?#]/.test( query ) ? query.slice( 1 ) : query )
    .split( '&' )
    .reduce( ( params, param ) => {
      let [ key, value ] = param.split( '=' )
      params[key] = value ? decodeURIComponent( value.replace( /\+/g, ' ' ) ) : ''
      return params
    }, { } )
}

window.addEventListener( 'load', () => {
  // Initialize the DatatTable and window.columnNames variables
  initDT()

  // Get repository name from URL `http://.../?q=<repo>`
  const repo = getQueryParams().q
  if ( repo ) {
    document.getElementById( 'q' ).value = repo
    fetchData()
  }
} )
