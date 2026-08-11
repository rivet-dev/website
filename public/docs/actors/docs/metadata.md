# Metadata

Metadata provides information about the currently running actor.

## Actor ID

Get the unique instance ID of the actor:

## Actor Name

Get the actor type name:

This is useful when you need to know which actor type is running, especially if you have generic utility functions that are shared between different actor implementations.

## Actor Key

Get the actor key used to identify this actor instance:

The key is used to route requests to the correct actor instance and can include parameters passed when creating the actor.

Learn more about using keys for actor addressing and configuration in the [keys documentation](/actors/docs/keys).

## Region

Region can be accessed from the context object via `c.region`.

<Warning>`c.region` is only supported on Rivet at the moment.</Warning>

## Example Usage